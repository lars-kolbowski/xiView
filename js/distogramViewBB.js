//		a distance histogram
//
//		Martin Graham, Colin Combe, Rappsilber Laboratory, 2015
//
//		distogram/Distogram.js

(function(global) {
    "use strict";

    global.CLMSUI = global.CLMSUI || {};
    
    global.CLMSUI.DistogramBB = global.CLMSUI.utils.BaseFrameView.extend ({
        events: function() {
          var parentEvents = global.CLMSUI.utils.BaseFrameView.prototype.events;
          if(_.isFunction(parentEvents)){
              parentEvents = parentEvents();
          }
          return _.extend({},parentEvents,{});
        },

        initialize: function (viewOptions) {
            global.CLMSUI.DistogramBB.__super__.initialize.apply (this, arguments);
            
            var defaultOptions = {
                xlabel: "Distance",
                ylabel: "Count",
                seriesNames: ["Cross Links", "Random"],
                scaleOthersTo: "Cross Links",
                chartTitle: "Distogram",
                maxX: 80
            };
            this.options = _.extend(defaultOptions, viewOptions.myOptions);

            this.precalcedDistributions = {};
            this.displayEventName = viewOptions.displayEventName;

            var self = this;

            // this.el is the dom element this should be getting added to, replaces targetDiv
            var mainDivSel = d3.select(this.el);

            mainDivSel.append("div").style("height", "40px")
                .append("button")
                .attr("class", "btn btn-1 btn-1a downloadButton")
                .text("Download Image");

            var chartDiv = mainDivSel.append("div")
                .attr("class", "panelInner distoDiv")
                .attr("id", "currentSampleDistogram")
                .style("position", "relative")
                .style("height", "calc( 100% - 40px )")
            ;
            //CLMSUI.utils.addFourCorners(mainDivSel);

            chartDiv.selectAll("*").remove();

            // Generate the C3 Chart
            var bid = "#" + chartDiv.attr("id");

            this.chart = c3.generate({
                bindto: bid,
                data: {
                    //x: 'x',
                    columns: [
                        this.options.seriesNames,
                    ],
                    type: 'bar',
                    colors: {
                        Random: "#aaa"
                    },
                    color: function (colour, d) {
                        var rm = self.model.get("rangeModel");
                        if (d.id && d.id !== "Random" && rm.get("active") && rm.get("scale")) {
                            return rm.get("scale")(d.x);
                        }
                        else if (!d.id && d !== "Random") {
                            return rm.get("scale").range()[2];
                        }
                        return colour;
                    },
                    selection: {
                        enabled: true,
                        grouped: true,
                        multiple: true,
                        draggable: true
                    },
                    ondragend: function (extent) {
                        console.log ("extent", extent);
                    }
                },
                bar: {
                    width: {
                        ratio: 0.8 // this makes bar width 50% of length between ticks
                            // need to poke c3.js code to see why the bars are initally zero width (whatever it calculates from is zero too I suspect)
                    }
                    //width: 8 // this makes bar width 8px
                },
                axis: {
                    x: {
                        label: this.options.xlabel //,
                            //max: this.options.maxX
                    },
                    y: {
                        label: this.options.ylabel,
                        tick: { // blank non-whole numbers on y axis with this function
                            // except this does the same for tooltips, so non-whole numbers dont get shown in tooltips unless tooltip.value overridden below
                            //format: function (n) {
                            //    console.log ("tooltipping", n);
                            //    return (n == Math.floor(n)) ? n : "";
                            //}
                        }
                    }
                },
                legend: {
                    //hide: this.options.seriesNames
                },
                padding: {
                    left: 40, // need this fixed amount if y labels change magnitude i.e. single figures only to double figures causes a horizontal jump
                    right: 20,
                    top: 0
                },
                tooltip: {
                    grouped: true,
                    format: {
                        title: function (x) {
                            return self.options.xlabel + " " + x;
                        },
                        name: function (name/*, ratio, id, index*/) {
                            return name + " " + self.options.ylabel;
                        },
                        value: function (value, ratio, id) {
                            var v = "";
                            if (value !== undefined) {
                                v = value.toFixed (id === "Random" ? 1 : 0);
                                if (id !== "Random") {
                                    v += "<span style='visibility:hidden; margin: 0'>.0</span>";
                                }
                            }
                            return v;
                        }
                    }
                },
                title: {
                    text: this.options.chartTitle
                }
            });

            this.listenTo (this.model, "filteringDone", this.render);    // listen to custom filteringDone event from model
            //this.listenTo (this.model.get("filterModel"), "change", this.render);    // any property changing in the filter model means rerendering this view
            this.listenTo (this.model.get("rangeModel"), "change:scale", this.relayout); 
            this.listenTo (this.model.get("distancesModel"), "change:distances", this.recalcRandomBinning);

            this.recalcRandomBinning();
            
            return this;
        },

        render: function () {
            
            if (global.CLMSUI.utils.isZeptoDOMElemVisible (this.$el)) {

                console.log ("re rendering distogram");

                var allProtProtLinks = this.model.get("clmsModel").get("proteinLinks").values();
                var pp1 = allProtProtLinks.next().value;
                var crossLinkMap = pp1.crossLinks;  // do values() after filtering in next line
                var filteredCrossLinks = this.model.getFilteredCrossLinks (crossLinkMap).values();
                var distances = this.model.get("distancesModel").get("distances");

                //console.log ("distances", distances);
                var distArr = global.CLMSUI.modelUtils.getCrossLinkDistances (filteredCrossLinks, distances);
                
                //console.log ("distArr", distArr);

                var series = [distArr, []];
                var seriesLengths = [crossLinkMap.size, this.randArrLength];  // we want to scale random distribution to unfiltered crosslink dataset size
                var countArrays = this.aggregate (series, seriesLengths, this.precalcedDistributions);

                var maxY = d3.max(countArrays[0]);  // max calced on real data only
                // if max y needs to be calculated across all series
                //var maxY = d3.max(countArrays, function(array) {
                //    return d3.max(array);
                //});
                
                // add names to front of arrays as c3 demands (need to wait until after we calc max otherwise the string gets returned as max)
                countArrays.forEach (function (countArray,i) { countArray.unshift (this.options.seriesNames[i]); }, this);
                
                //console.log ("thresholds", thresholds);
                var curMaxY = this.chart.axis.max().y;
                if (curMaxY === undefined || curMaxY < maxY) {   // only reset maxY if necessary as it causes redundant repaint (given we load and repaint straight after)
                    console.log ("resetting axis max");
                    this.chart.axis.max({y: maxY});
                }

                this.chart.load({
                    columns: countArrays
                });

                //console.log ("data", distArr, binnedData);
            }

            return this;
        },
        
        aggregate: function (series, seriesLengths, precalcedDistributions) {
            // get extents of all arrays, concatenate them, then get extent of that array
            var extent = d3.extent ([].concat.apply([], series.map (function(d) { return d3.extent(d); })));
            //var thresholds = d3.range (Math.min(0, Math.floor(extent[0])), Math.max (40, Math.ceil(extent[1])) + 1);
            var thresholds = d3.range (Math.min (0, Math.floor(extent[0])), Math.max (Math.ceil(extent[1]), this.options.maxX));
            if (thresholds.length === 0) {
                thresholds = [0, 1]; // need at least 1 so empty data gets represented as 1 empty bin
            }
            
            var sIndex = this.options.seriesNames.indexOf (this.options.scaleOthersTo);
            var targetLength = sIndex >= 0 ? seriesLengths[sIndex] : 1; 

            var countArrays = series.map (function (aseries, i) {
                var aseriesName = this.options.seriesNames[i];
                var binnedData = precalcedDistributions[aseriesName]
                    ? precalcedDistributions[aseriesName]
                    : d3.layout.histogram().bins(thresholds)(aseries)
                ;

                var scale = sIndex >= 0 ? targetLength / (seriesLengths[i] || targetLength) : 1;
                return binnedData.map (function (nestedArr) {
                    return nestedArr.y * scale;
                });
            }, this);

            return countArrays;
        },

        recalcRandomBinning: function () {
            console.log ("precalcing random bins for distogram view");
            var randArr = this.model.get("distancesModel").flattenedDistances();
            var thresholds = d3.range(0, this.options.maxX);
            var binnedData = d3.layout.histogram()
                .bins(thresholds)
                (randArr)
            ;
            this.randArrLength = randArr.length;
            this.precalcedDistributions = this.precalcedDistributions || {};
            this.precalcedDistributions["Random"] = binnedData;
        },

        relayout: function () {
            // fix c3 setting max-height to current height so it never gets bigger y-wise
            // See https://github.com/masayuki0812/c3/issues/1450
            d3.select(this.el).select(".c3").style("max-height", "none");   

            this.chart.resize();

            return this;
        },

        // removes view
        // not really needed unless we want to do something extra on top of the prototype remove function (like destroy c3 view just to be sure)
        remove: function () {
            global.CLMSUI.DistogramBB.__super__.remove.apply (this, arguments);    
        
            // this line destroys the c3 chart and it's events and points the this.chart reference to a dead end
            this.chart = this.chart.destroy();
        }

    });
    
} (this));