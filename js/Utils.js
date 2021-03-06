var CLMSUI = CLMSUI || {};

CLMSUI.utils = {

    debug: false,

    xilog: function () {
        if (this.debug && (typeof(console) !== 'undefined')) {
            console.log.apply (console, arguments);
        }
    },

    commonRegexes: {
        uniprotAccession: new RegExp ("[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}", "i"),
        pdbPattern: "[A-Za-z0-9]{4}",
        hexColour: new RegExp ("#[0-9A-F]{3}([0-9A-F]{3})?", "i"),   // matches #3-char or #6-char hex colour strings
    },

    // return comma-separated list of protein names from array of protein ids
    proteinConcat: function (match, matchedPeptideIndex, clmsModel) {
        var mpeptides = match.matchedPeptides[matchedPeptideIndex];
        var pnames = mpeptides ? mpeptides.prt.map (function(pid) {return clmsModel.get("participants").get(pid).name;}) : [];
        return pnames.join(",");
    },

    pepPosConcat: function (match, matchedPeptideIndex) {
        var mpeptides = match.matchedPeptides[matchedPeptideIndex];
        return mpeptides ? mpeptides.pos.join(", ") : "";
    },
	
	fullPosConcat: function (match, matchedPeptideIndex) {
        var mpeptides = match.matchedPeptides[matchedPeptideIndex];
		var linkPos = matchedPeptideIndex === 0 ? match.linkPos1 : match.linkPos2;
        return mpeptides ? mpeptides.pos.map (function (v) { return v + linkPos - 1; }).join(", ") : "";
    },

    commonLabels: {
        downloadImg: "Download Image As ",  // http://ux.stackexchange.com/a/61757/76906
		shareLink: "Share Search Link with Current Filter State",
    },
	
	commonTemplates: {
		downloadImg: _.template("Download Image As <%=fileType%>"),
		downloadCSV: _.template("Download Filtered <%=items> as CSV"),
	},

    addFourCorners: function (d3DivSelection) {
        var classNames = ["dynDiv_resizeDiv_tl", "dynDiv_resizeDiv_tr", "dynDiv_resizeDiv_bl", "dynDiv_resizeDiv_br"];
        var fourCorners = d3DivSelection
            .selectAll("div")
            .data(classNames, function(d) { return d; })    // key on classnames
            .enter()
            .append("div")
                .attr("class", function(d) { return d; } )  // make class the classname entry
                .classed ("draggableCorner", true)
        ;

        return fourCorners;
    },

    addDynDivParentBar: function (d3DivSelection) {
        var parentBar = d3DivSelection
            .append("div")
            .attr("class", "dynDiv_moveParentDiv dynDiv_bodyLimit")
        ;

        parentBar
            .append("span")
            .attr("class", "dynTitle")
            //.text ("Title")
        ;

        parentBar
            .append ("i")
            .attr ("class", "fa fa-times-circle closeButton")
        ;
        return parentBar;
    },

    addDynDivScaffolding : function (d3DivSelection) {
        CLMSUI.utils.addDynDivParentBar (d3DivSelection);
        CLMSUI.utils.addFourCorners (d3DivSelection);
    },

    // http://stackoverflow.com/questions/10066630/how-to-check-if-element-is-visible-in-zepto
    isZeptoDOMElemVisible : function (zeptoElem) {   // could be a jquery-ref'ed elem as well
        //console.log ("zepto", zeptoElem);
        var display = zeptoElem.css('display') !== 'none';
        return display && (zeptoElem.css('visibility') !== 'hidden') && (zeptoElem.height() > 0);
    },

    // try .layerX / .layerY first as .offsetX / .offsetY is wrong in firefox
    // in fact don't use layerX / offsetX, they're unreliable cross-browser
    crossBrowserElementX : function (evt, optElem) {
        return evt.clientX - $(optElem || evt.target).offset().left;    // use evt.target if no optional element passed
        //return (evt.layerX || evt.offsetX) - evt.target.offsetLeft;
    },

    crossBrowserElementY : function (evt, optElem) {
        return evt.clientY - $(optElem || evt.target).offset().top;
    },

    buttonView: Backbone.View.extend ({
        tagName: "span",
        className: "buttonPlaceholder",
        events: {
            "click button": "buttonClicked"
        },

        initialize: function (viewOptions) {
            var defaultOptions = {};
            this.options = _.extend (defaultOptions, viewOptions.myOptions);

            // this.el is the dom element this should be getting added to, replaces targetDiv
            var sel = d3.select(this.el);
            if (!sel.attr("id")) {
                sel.attr("id", this.options.id);
            }

            sel.append("button")
                .attr("class", "btn")
                .text (this.options.label)
            ;
        },

        buttonClicked: function () {
            CLMSUI.vent.trigger (this.options.eventName, true);
        }
    }),

	checkBoxView: Backbone.View.extend ({
		tagName: "span",
		className: "buttonPlaceholder",
		events: {
			"click input": "checkboxClicked"
		},

		initialize: function (viewOptions) {

			//console.log ("this", this.model);
			var defaultOptions = {
				labelFirst: true
			};
			this.options = _.extend(defaultOptions, viewOptions.myOptions);

			// this.el is the dom element this should be getting added to, replaces targetDiv
			var sel = d3.select(this.el);
			if (!sel.attr("id")) {
				sel.attr("id", this.options.id.replace(/ /g, "_"));
			}

			var labs = sel.append("label")
				.attr("class", "btn")
			;
			labs.append ("input")
				.attr ("id", sel.attr("id")+"ChkBx")
				.attr("type", "checkbox")
			;
			var labelText = this.options.labelFirst ? labs.insert("span", ":first-child") : labs.append("span");
			labelText.text (this.options.label);

			// Remember to listen to changes to model or global event state that come from outside the view (keeps it in sync with models)
			if (this.model && this.options.toggleAttribute) {
				this.listenTo (this.model, "change:"+this.options.toggleAttribute, this.showState);
			} else if (this.options.eventName) {
				this.listenTo (CLMSUI.vent, this.options.eventName, this.showState);
			}
		},

		showState: function (args) {
			var boolVal = arguments.length > 1 ? arguments[1] : arguments[0];
			d3.select(this.el).select("input").property("checked", boolVal);
		},

		checkboxClicked: function () {
			var checked = d3.select(this.el).select("input").property("checked");
			if (this.model && this.options.toggleAttribute) {
				this.model.set (this.options.toggleAttribute, checked);
			} else if (this.options.eventName) {
				CLMSUI.vent.trigger (this.options.eventName, checked);
			}
		}
	}),

    radioButtonView: Backbone.View.extend ({
        tagName: "span",
        className: "buttonPlaceholder",
        events: {
            "click input": "checkboxClicked"
        },

        initialize: function (viewOptions) {
            var defaultOptions = {
                labelFirst: true
            };
            this.options = _.extend(defaultOptions, viewOptions.myOptions);

            // this.el is the dom element this should be getting added to, replaces targetDiv
            var sel = d3.select(this.el);
            if (!sel.attr("id")) {
                sel.attr("id", this.options.id.replace(/ /g, "_"));
            }

            var labs = sel.append("label")
                .attr("class", "btn")
            ;
            labs.append ("input")
                .attr ("id", sel.attr("id")+"ChkBx")
                .attr("type", "radio")
            ;
            var labelText = this.options.labelFirst ? labs.insert("span", ":first-child") : labs.append("span");
            labelText.text (this.options.label);

            // Remember to listen to changes to model or global event state that come from outside the view (keeps it in sync with models)
            if (this.model && this.options.toggleAttribute) {
                this.listenTo (this.model, "change:"+this.options.toggleAttribute, this.showState);
            } else if (this.options.eventName) {
                this.listenTo (CLMSUI.vent, this.options.eventName, this.showState);
            }
        },

        showState : function (args) {
            var boolVal = arguments.length > 1 ? arguments[1] : arguments[0];
            d3.select(this.el).select("input").property("checked", boolVal);
        },

        checkboxClicked: function () {
            var checked = d3.select(this.el).select("input").property("checked");
            if (this.model && this.options.toggleAttribute) {
                this.model.set (this.options.toggleAttribute, checked);
            } else if (this.options.eventName) {
                CLMSUI.vent.trigger (this.options.eventName, checked);
            }
        }
    }),

    niceRoundMap: {1: 1, 2: 2, 3: 3, 4: 5, 5: 5, 6: 10, 7: 10, 8: 10, 9: 10, 10: 10},

    niceRound: function (val) {
        var log = Math.floor (Math.log(val) / Math.log(10));//no log10 func in IE
        var pow = Math.pow (10, log);
        val = Math.ceil (val / pow);  // will now be a number 1-10
        var roundVal = CLMSUI.utils.niceRoundMap[val];
        roundVal *= pow;
        return roundVal;
    },

    // correlates to d3's .round with decimal places function
    ceil: function (val, decimalPlaces) {
        var pow = Math.pow (10, decimalPlaces);
        val *= pow;
        val = Math.ceil (val);
        return val / pow;
    },

    floor: function (val, decimalPlaces) {
        var pow = Math.pow (10, decimalPlaces);
        val *= pow;
        val = Math.floor (val);
        return val / pow;
    },

    displayError: function (condition, message, borderColour, scale) {
        if (condition()) {
            var box = d3.select("#clmsErrorBox");
            if (box.empty()) {
                box = d3.select("body").append("div").attr("id", "clmsErrorBox");
				box.append("div");
				box.append ("i")
					.attr("class", "fa fa-times-circle errorCloseButton closeButton")
					.attr ("title", "Close Dialog")
					.on ("click", function () { box.style ("display", "none"); })
				;
            }

            box
				.style ("opacity", 0)
                .style ("display", "block")
				.style ("border-color", borderColour || null)
				.style ("transform", "scale("+(scale || "1")+")")
				.select ("div")
                .html (message)
			;
			box
				.transition()
				.duration(500)
				.style ("opacity", 1)
            ;
        }
    },

    convertCanvasToImage: function (d3canvas, image, callback) {	// d3canvas is a canvas wrapped in a d3 selection
        image
            .attr ("width", d3canvas.attr("width"))
            .attr ("height", d3canvas.attr("height"))
            .attr ("transform", d3canvas.style("transform"))
            .attr ("xlink:href", function () {
				// from https://stackoverflow.com/a/19539048/368214
				// use dummy canvas and fill with background colour so exported png is not transparent
				var destinationCanvas = document.createElement("canvas");
				destinationCanvas.width = d3canvas.attr("width");
				destinationCanvas.height = d3canvas.attr("height");

				var destCtx = destinationCanvas.getContext('2d');

				//create a rectangle with the desired color
				var background = d3canvas.style("background-color");
				console.log ("background", background, d3canvas);
				// convert if background style string in rgb() format
				if (background && background[0] !== '#') {
					var rgb = d3.rgb (background);
					background = rgb.toString();
				}
				//console.log ("background", background, d3canvas.attr("width"), d3canvas.attr("height"));
				destCtx.fillStyle = background;
				destCtx.fillRect (0, 0, d3canvas.attr("width"), d3canvas.attr("height"));

				//draw the original canvas onto the destination canvas
				destCtx.drawImage (d3canvas.node(), 0, 0);
			
                var url = destinationCanvas.toDataURL ("image/png");
				//var url = d3canvas.node().toDataURL ("image/png");
				//destinationCanvas.dispose();
				return url;
            })
            //.attr ("xlink:href", "http://www.spayaware.ie/images/cat.png")
        ;
        callback (image);
    },

    declutterAxis: function (d3AxisElem) {
        var lastBounds = {left: -100, right: -100, top: -100, bottom: -100};
        d3AxisElem.selectAll(".tick text")
            .each (function () {
                var text = d3.select(this);
                var bounds = this.getBoundingClientRect();
                var overlap = !(bounds.right <= lastBounds.left || bounds.left >= lastBounds.right || bounds.bottom <= lastBounds.top || bounds.top >= lastBounds.bottom);
                text.style ("visibility", overlap ? "hidden" : null);
                if (!overlap) {
                    lastBounds = bounds;
                }
            })
        ;
    },

    RadioButtonFilterViewBB: Backbone.View.extend ({
        tagName: "div",
        events: {
            "click .singleRadioButton": "changeFilter"
        },
        initialize: function (initData) {
            var defaultOptions = {
                states: [0,1],
                labels: ["Option 1", "Option 2"],
                header: "A Filter",
                eventName: undefined,
                labelGroupFlow: "horizontalFlow"
            };
            this.options = _.extend(defaultOptions, initData.myOptions);
            if (this.options.eventName) {
                this.listenTo (CLMSUI.vent, this.options.eventName, this.showState);
            }
            this.render();
        },

         render: function () {
             var self = this;
             var con = d3.select(this.el);
             con.append("p").attr("class", "headerLabel").text(this.options.header);

             var sel = con.selectAll("label.singleChoice").data(this.options.states);
             var labs = sel.enter()
                .append ("label")
                .attr("class", "singleChoice "+self.options.labelGroupFlow)
             ;
             labs
                .append ("input")
                .attr("type", "radio")
                .attr("name", self.el.id + "RBGroup")
                .attr("value", function(d) { return d; })
                .attr("class", "singleRadioButton")
                //.property("checked", function(d,i) { return i == self.options.presetIndex; })
             ;
            var labels = this.options.labels;
             labs.append("span").text(function(d,i) { return labels[i]; });
         },

        showState : function (filterVal) {
            //console.log ("in show state rb", filterVal);
            var self = this;
            d3.select(this.el).selectAll("input.singleRadioButton")
                .property("checked", function(d,i) { return self.options.states[i] == filterVal; })
            ;
        },

         changeFilter: function (evt) {
             if (this.options.eventName) {
                CLMSUI.vent.trigger (this.options.eventName, +evt.currentTarget.value);
             }
         }
     }),

    // Routine assumes on click methods are added via backbone definitions, though they could be added later with d3
    // targetDiv is a d3 select element
    // buttonData array of objects of type:
    // {class: "circRadio", label: "Alphabetical", id: "alpha", type: "radio"|"checkbox"|"button",
    // initialState: true|false, group: "sort", tooltip: "tooltipText", noBreak: true|false},
    makeBackboneButtons: function (targetDiv, baseID, buttonData) {
        var makeID = function (d) { return baseID + d.id; };

        // Don't make buttons whose id already exists
        buttonData = buttonData.filter (function (d) {
            return d3.select("#"+makeID(d)).empty();
        });

        targetDiv.selectAll("button.tempClass")  // .tempClass ensures existing buttons aren't picked up, only new ones created
            .data (buttonData.filter(function(bd) { return bd.type === "button"; }), function(d) { return d.id; })
            .enter()
            .append("button")
                .text (function(d) { return d.label; })
                .attr ("class", function(d) { return d.class; })
                .classed ("btn btn-1 btn-1a", true) // and we don't class .temp so these can't be picked up by a subsequent call to make backbonebuttons
				.attr ("title", function(d) { return d.tooltip; })
                .attr("id", makeID)
        ;

        var cboxes = targetDiv.selectAll("label.tempClass")	// .tempClass ensures existing buttons aren't picked up, only new ones created
            .data (buttonData.filter(function(bd) { return bd.type === "checkbox" || bd.type === "radio"; }), function(d) { return d.id; })
            .enter()
            .append ("label")
                .attr ("class", "btn noBreak")
                .attr ("title", function(d) { return d.tooltip; })
                .attr ("id", makeID)
        ;
		
		// add header if asked for
		cboxes
            .filter (function(d) { return d.header; })
            .append ("span")
                .attr ("class", "ddSectionHeader")
                .text (function(d) { return d.header; })
        ;

		// add text first if asked for
        cboxes
            .filter (function(d) { return !d.inputFirst; })
            .append ("span")
                .style ("white-space", function(d) { return d.noBreak ? "nowrap" : "normal"; })
                .text (function(d) { return d.label; })
        ;

		// add input control
        cboxes.append ("input")
            .attr("type", function(d) { return d.type; })
            .attr("class", function(d) { return d.class; })
            .property ("checked", function(d) { return d.initialState; })
			.property ("value", function (d) { return d.value; })
            .each (function(d) {
                if (d.group) {
                    d3.select(this).attr("name", d.group);
                }
            })
        ;

		// add text last if asked for
        cboxes
            .filter (function(d) { return d.inputFirst; })
            .append ("span")
                .style ("white-space", function(d) { return d.noBreak ? "nowrap" : "normal"; })
                .text (function(d) { return d.label; })
        ;
    },

    // Functions for making useful file names

    objectStateToAbbvString: function (object, fields, zeroFormatFields, abbvMap) {
        fields = fields.filter (function (field) {
            var val = object.get ? object.get(field) || object[field] : object[field];
            return !(val === "" || val === false || val === undefined);
        }, this);

        //console.log ("fields", fields);

        var zeroFormat = d3.format (".4f");
        var strValue = function (field, val) {
            if (val === true) {
                return "";
            }
            if (zeroFormatFields.has(field) && !isNaN(val)) {
                return zeroFormat(val);
            }
            if ($.isArray (val)) {
                var arrayStr = val.map (function (elem) {
                    return strValue (field, elem);
                });
                return arrayStr.join("-");
            }
            return val;
        };

        var strParts = fields.map (function(field) {
            var val = object.get ? object.get(field) || object[field] : object[field];
            return (abbvMap[field] || field.toUpperCase()) + (val === true ? "" : "=" + strValue (field, val));
        }, this);
        return strParts.join(".");
    },

    filterStateToString: function () {
        var filterStr = CLMSUI.compositeModelInst.get("filterModel").stateString();
        return filterStr.substring(0, 160);
    },

    searchesToString: function () {
        var searches = Array.from (CLMSUI.compositeModelInst.get("clmsModel").get("searches"));
        var searchKeys = searches.map (function (search) { return search[0]; }); // just the keys
        var searchStr = ("SRCH="+searchKeys.join("-")).substring(0, 40);
        return searchStr;
    },

    makeLegalFileName: function (fileNameStr) {
        var newStr = fileNameStr.replace (/[^a-zA-Z0-9-=&()¦_\\.]/g, "");
        newStr = newStr.substring (0, 240);
        return newStr;
    },


    // Function for making a cross-link colour key as an svg group element
    updateColourKey: function (model, svgElem) {
		svgElem.attr("height", "200");
		
        var keyGroup = svgElem.selectAll("g.key").data([0]);
		keyGroup.enter()
			.append("g").attr("class", "key")
            .append("text").attr("class", "keyTitle")
        ;

        var colourAssign = model.get("linkColourAssignment");
        if (colourAssign) {
            keyGroup.select("text.keyTitle")
                .attr("y", 12)
                .text ("Key: "+colourAssign.get("title"))
            ;

            var colScale = colourAssign.get("colScale");
            var labels = colourAssign.get("labels");
			var domain = colScale.domain(); 
            var pairUp = d3.zip (colScale.range(), labels.range());
			var isLinear = colourAssign.get("type") === "linear";
			var linearHeight = 150;
			var normalScale = d3.scale.linear().domain(d3.extent(domain)).range([0,100]);
			var heightScale = d3.scale.linear().domain(d3.extent(domain)).range([18,linearHeight+18]);
			
			if (colourAssign.get("type") === "threshold") {
				pairUp.forEach (function (pair, i) {
					var d1 = i > 0 ? ">"+domain[i-1] : undefined;
					var d2 = i < domain.length ? "<"+domain[i] : undefined;
					var dp = [d1,d2].filter(function(d) { return d !== undefined; });
					pair[1] += " (" + dp.join(" & ") + ")";
				});
			}
			
			pairUp.forEach (function (pair, i) {
				pair[2] = isLinear ? heightScale (domain[i]) : 3+((i+1)*15);	// y-position of colour swatches and labels
			});

            var colourElems = keyGroup.selectAll("g.keyPoint").data(pairUp);
            colourElems.exit().remove();
            var newElems = colourElems.enter().append("g")
                .attr("class", "keyPoint")
                .attr("transform", function(d) { return "translate(0,"+d[2]+")"; })
            ;
            newElems.append("rect")
                .attr("height", 4)
				.attr ("width", "1em")
				.attr("x", 1)
                .attr("y", 5)
				.style ("stroke", "none")
            ;
            newElems.append("text")
                .attr("x", 19)
                .attr("y", 12)
            ;
            colourElems.select("rect")
				.style("fill", function (d, i) { return d[0]; })
				.style("display", isLinear ? "none" : null)	// hide if showing linear scale
			;
            colourElems.select("text").text(function (d, i) { return d[1]; });
			
			
			if (isLinear) {
				// Make gradient and fill a rect with it
				var gradID = "grad"+Math.ceil(Math.random() * 100000);
				
				var defs = svgElem.selectAll("defs").data([0]);
				defs.enter().append("defs");
				var grad = defs.selectAll("#"+gradID).data([0]);
				var newGrad = grad.enter().append("linearGradient")
					.attr("id", gradID)
					.attr("x1", "0%")
					.attr("x2", "0%")
					.attr("y1", "0%")
					.attr("y2", "100%")
				;
				newGrad.selectAll("stop").data(domain)
					.enter()
					.append("stop")
					.attr("offset", function(d) { return Math.round(normalScale(d))+"%"; })
					.attr("stop-color", function (d,i) { return colScale.range()[i]; })
				;
				
				svgElem.selectAll("rect.gradientScale").remove();
				
				svgElem.append("rect")
					.attr("class", "gradientScale")
					.attr("x", 1)
					.attr("y", heightScale.range()[0] + 5)
					.attr("width", "1em")
					.attr("height", heightScale.range()[1] - heightScale.range()[0])
					.attr("fill", "url(#"+gradID+")")
				;
			}
        }
    },
	
	testColourKey: function () {
		var svg = d3.select("body").append("svg").attr("class", "testTopLeft").style("width", "300px").style("height", "200px");
		CLMSUI.utils.updateColourKey (CLMSUI.compositeModelInst, svg);
	},
	
	updateAnnotationColourKey: function (bbModelArray, svgElem, myOptions) {
		var defaults = {
			colour: function (d) { return d.colour; },
			label: function (d) { return d.label || d.name; },
			title: "Key",
		};
		var options = $.extend ({}, defaults, myOptions);
		
        var keyGroup = svgElem.select("g.key");
        if (keyGroup.empty()) {
            svgElem
                .append("g")
					.attr("class", "key")
                    .append("text").attr("class", "keyTitle")
            ;
        }
        keyGroup = svgElem.select("g.key");

		keyGroup.select("text.keyTitle")
			.attr("y", 12)
			.text ("Key: "+options.title)
		;

		var pairUp = bbModelArray.map (function (model) {
			var modelJSON = model.toJSON();
			return [options.colour (modelJSON), options.label (modelJSON)];
		})

		var colourElems = keyGroup.selectAll("g.keyPoint").data(pairUp);
		colourElems.exit().remove();
		var newElems = colourElems.enter().append("g")
			.attr("class", "keyPoint")
			.attr("transform", function(d,i) { return "translate(0,"+(3+((i+1)*15))+")"; })
		;
		newElems.append("rect")
			.attr("x", 1)
			.attr("width", "1em")
			.attr("height", "1em")
		;
		newElems.append("text")
			.attr("x", 19)
			.attr("y", 12)
		;
		colourElems.select("rect").style("fill", function (d) { return d[0]; });
		colourElems.select("text").text(function (d) { return d[1]; });
    },


    // settings can be
    // addToElem - element to add select elements to
    // selectList - names of select elements to add
    // optionList - options to add to each select element (same)
    // selectLabelFunc - function to set human readable name for select element label
    // optionLabelFunc - function to set human readable name for option
    // changeFunc - function that runs when change event occurs on a select element
    // initialSelectionFunc - function that decides initially set option
    addMultipleSelectControls: function (settings) {
        var defaults = {
            selectList: [],
            optionList: [],
            selectLabelFunc: function (d) { return d; },
            optionLabelFunc: function (d) { return d; },
			optionValueFunc: function (d) { return d; },
			selectLabelTooltip: function (d) { return undefined; },
            initialSelectionFunc: function (d,i) { return i === 0; },
			idFunc: function (d,i) { return i; },
        };
        settings = _.extend (defaults, settings);

        // Add a number of select widgets for picking axes data types
        var selectHolders = settings.addToElem.selectAll("label.selectHolder")
            .data(settings.selectList, function(d) { return d.id ? d.id : d; })
        ;

        // new select elements
        selectHolders
            .enter()
            .append ("label")
            .attr ("class", "btn selectHolder")
                .append ("span")
                .attr ("class", "noBreak")
				.each (function (d) {
					var tip = settings.selectLabelTooltip (d);
					if (tip) {
						d3.select(this).attr ("title", tip);
					}
				})
                .text (settings.selectLabelFunc)
                .append("select")
                    .on ("change", settings.changeFunc)
        ;

        var optionData = settings.optionList.slice();
        if (settings.keepOldOptions) {
            var existingOptions = selectHolders.select("select").selectAll("option");
            var oldData = existingOptions.length ? existingOptions.data() : [];
            //console.log ("OLD DATA", oldData);
            optionData = oldData.concat(optionData);
        }
        //console.log ("SETTUINGS", optionData);

        // add options to new and existing select elements
        var selects = selectHolders.selectAll("select");
        var options = selects
            .selectAll("option")
            .data (optionData, settings.idFunc)
		;
		options.exit().remove();
		options
            .enter()
            .append ("option")
            .property ("selected", settings.initialSelectionFunc)  // necessary for IE not to fall over later (it detects nothing is selected otherwise)
        ;
		options
			.text (settings.optionLabelFunc)
			.property ("value", settings.optionValueFunc)
		;

        return selects;
    },
	
	drawDendrogram: function (svgd3, cfckDistances, options) {
		
		var defaultOptions = {
			ltor: true,
			ttob: true,
			leafLabels: true,
			labelFunc: function (d) { return d ? d.value : ""; },
			title: "A Dendrogram",
		}
		options = $.extend ({}, defaultOptions, options);
		
		function recurse (tree, parent) {
			tree.parent = parent;
			if (!tree.value) {
				recurse (tree.left, tree);
				recurse (tree.right, tree);
			} else {
				tree.origValue = tree.value;
			}
		}
		
		var height = cfckDistances.size * 5;
		var width = 100;

		svgd3.attr("width", width).attr("height", height);
		var g = svgd3.selectAll("g.dendro").data([0]);
		g.enter().append("g").attr("class", "dendro");
		
		var title = g.selectAll("text.dendrogramTitle").data([0]);
		title.enter().append("text").attr("class", "dendrogramTitle").attr("y", -20);
		title.text (options.title);
		
		recurse (cfckDistances, null);
		
		var cluster = d3.layout.cluster ();
		cluster
			.children (function(d) { return d.left && d.right ? [d.left, d.right] : undefined; })
			.size ([height, width])
			.separation (function (a, b) { return 1; })
		;
		
		var nodes = cluster.nodes(cfckDistances);
		var links = cluster.links(nodes);
		
		var crange = d3.extent (nodes, function(d) { return d.dist || 0; });
		var scaleDown = d3.scale.linear().domain(crange).range(options.ltor ? [width - 5, 5] : [5, width - 5]);
		var scaleAlong = d3.scale.linear().domain([0, height]).range(options.ttob ? [height, 0] : [0, height]);
	
		//console.log ("nodes", nodes, links, crange);
		
		nodes.forEach (function(d) { 
			d.y = scaleDown (d.children && d.children.length ? d.dist || 0 : 0); 
			d.x = scaleAlong (d.x);
		});
		
		var link = g.selectAll(".dlink").data(links);
		
		link.exit().remove();
		link.enter().append("g")
			.attr("class", "dlink")
			.append("path");
		;
		link.select("path").attr ("d", function (d) {
			return "M"+d.source.y+" "+d.source.x+" V "+d.target.x+" H "+d.target.y;
		});
		
		if (options.leafLabels) {
			var labels = g.selectAll("text.dlabel")
				.data(nodes.filter (function (d) { return !d.children; }))
			;
			labels.exit().remove();
			labels.enter().append ("text").attr("class", "dlabel");
			labels.text (options.labelFunc)
				.style ("text-anchor", options.ltor ? "start" : "end")
				.attr ("x", options.ltor ? width : 0)
				.attr ("y", function (d) { return d.x; })
				.attr ("dy", "0.35em")
			;
		} else {
			g.selectAll(".dlabel").remove();
		}

		/*
		var node = g.selectAll(".dnode").data(nodes);
		node.exit().remove();
		node.enter().append("g")
			.attr("class", "dnode")
			.append("circle")
			.attr("r", 2.5)
		;
		node.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
		*/
	},


    BaseFrameView: Backbone.View.extend ({

        events: {
            // following line commented out, mouseup sometimes not called on element if pointer drifts outside element
            // and dragend not supported by zepto, fallback to d3 instead (see later)
            // "mouseup .draggableCorner": "relayout",    // do resize without dyn_div alter function
            "click .downloadButton": "downloadSVG",
            "click .downloadButton2": "downloadSVGWithCanvas",
            "click .closeButton": "hideView",
            "click": "bringToTop",
        },

        initialize: function (viewOptions) {

            // window level options that don't depend on type of view
            var globalOptions = {
				canBringToTop: true,
				background: null,
			};
            this.options = _.extend (globalOptions, this.defaultOptions, viewOptions.myOptions);

            this.displayEventName = viewOptions.displayEventName;

            var self = this;

            // this.el is the dom element this should be getting added to, replaces targetDiv
            var mainDivSel = d3.select(this.el);

            // Set up some html scaffolding in d3
            CLMSUI.utils.addDynDivScaffolding (mainDivSel);
            mainDivSel.select(".dynTitle").text (this.identifier);

            // add drag listener to four corners to call resizing locally rather than through dyn_div's api, which loses this view context
            var drag = d3.behavior.drag().on ("dragend", function() { self.relayout({dragEnd: true}); });
            mainDivSel.selectAll(".draggableCorner")
                .call (drag)
            ;

            if (this.displayEventName) {
                this.listenTo (CLMSUI.vent, this.displayEventName, this.setVisible);
            }

            return this;
        },

        render: function () {
            return this;
        },

        relayout: function () {
            return this;
        },

        // use thisSVG d3 selection to set a specific svg element to download, otherwise take first in the view
        downloadSVG: function (event, thisSVG) {
            var svgSel = thisSVG || d3.select(this.el).selectAll("svg");
            var svgArr = [svgSel.node()];
            var svgStrings = CLMSUI.svgUtils.capture (svgArr);
            var svgXML = CLMSUI.svgUtils.makeXMLStr (new XMLSerializer(), svgStrings[0]);
            //console.log ("xml", svgXML);

            var fileName = this.filenameStateString().substring (0,240);
            download (svgXML, 'application/svg', fileName+".svg");
        },

        canvasImageParent: "svg",

        /**
        Called when we need to change a canvas element to an image to add to a cloned svg element we download.
        Needs canvasImageParent set to decide where to place it in an svg (e.g. for matrix we put it in a g with a clipPath)
        And add an extra css rule after the style element's already been generated to try and stop the image anti-aliasing
        */
        downloadSVGWithCanvas: function () {
            var svgSel = d3.select(this.el).selectAll("svg");
            var svgArr = [svgSel.node()];
            var svgStrings = CLMSUI.svgUtils.capture (svgArr);
            var detachedSVG = svgStrings[0];
            var detachedSVGD3 = d3.select (detachedSVG);
            var self = this;

            // Add image to existing clip in svg, (as first-child so sibling group holding links appears on top of it)
            var img = detachedSVGD3
                .select(self.canvasImageParent)  // where to add image
                .insert ("svg:image", ":first-child")
            ;

            // Add a rule to stop the image being anti-aliased (i.e. blurred)
            img.attr("class", "sharpImage");
            var extraRule = "image.sharpImage {image-rendering: optimizeSpeed; image-rendering: -moz-crisp-edges; -ms-interpolation-mode: nearest-neighbor; image-rendering: pixelated; }";
            var style = detachedSVGD3.select("style");
            style.text (style.text() + "\n" + extraRule);

            var fileName = this.filenameStateString()+".svg";
            // Now convert the canvas and its data to the image element we just added and download the whole svg when done
            CLMSUI.utils.convertCanvasToImage (this.canvas, img, function () {
                var svgXML = CLMSUI.svgUtils.makeXMLStr (new XMLSerializer(), detachedSVG);
                download (svgXML, "application/svg", fileName);
            });
        },
		
		getHTMLAsDataURL: function (d3Elem, options, callbackFunc) {
			var defaults = {
				removeChildren: undefined,
			};
			options = $.extend ({}, defaults, options);
			
			callbackFunc = callbackFunc || function () { console.warn ("Missing a callback func for downloadHTMLAsImg!"); };
			var elemArr = [d3Elem.node()];
			var elemStrings = CLMSUI.svgUtils.capture (elemArr);
			var detachedSVG = elemStrings[0];
            var detachedSVGD3 = d3.select (detachedSVG);
			
			var origElem = detachedSVGD3.select(":not(style)");
			origElem.style ("font-size", "1em");
			
			var fo = detachedSVGD3.append(function() {
					//aaargh, a whole day to find out foreignObject gets lower-cased and then doesn't work in regular append
					return document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")	
				})
				.attr("width", "100%").attr("height", "100%")
				.append ("div")
					.attr("xmlns", "http://www.w3.org/1999/xhtml")
					.html (origElem.node().outerHTML);
			;
			origElem.remove();
			//$(fo.node()).append($(table.node()));
			if (options.removeChildren) {
				detachedSVGD3.selectAll(options.removeChildren).remove();
			}
			var data = detachedSVGD3.node().outerHTML;
			
			var canvas = document.createElement ("canvas");
			d3.select(canvas)
				.attr ("id", "tempCanvas")
				.style("display", "none")
				.attr ("width", $(detachedSVGD3.node()).width())
				.attr ("height", $(detachedSVGD3.node()).height())
			;
    		var ctx = canvas.getContext("2d");
			
			var svg = new Blob([data], {
				type: "image/svg+xml;charset=utf-8"
			});
			//var DOMURL = URL || webkitURL || this;
			//var url = DOMURL.createObjectURL(svg);	// causes tainted canvas error due to https://bugs.chromium.org/p/chromium/issues/detail?id=294129
			// console.log ("sv", svg, url);
			
			var img = new Image();
			img.setAttribute ("crossOrigin", "anonymous");
			img.onerror = function () {
				callbackFunc (undefined);
			}
			img.onload = function() {
				ctx.drawImage (img, 0, 0);
				//console.log ("img", img, url);
				
				img = null;
				//DOMURL.revokeObjectURL (url);
				
				var dataURL = canvas.toDataURL();
				var size = {width: canvas.width, height: canvas.height};
				canvas = null;
				
				callbackFunc (dataURL, size);
				//console.log ("dd", dataURL);
			}
		
			// Get around https://bugs.chromium.org/p/chromium/issues/detail?id=294129
    		img.src = "data:image/svg+xml;charset=utf-8," + data;  
		},


        hideView: function () {
            CLMSUI.vent.trigger (this.displayEventName, false);
        },

        // find z-indexes of all visible, movable divs, and make the current one a higher z-index
        // then a bit of maths to reset the lowest z-index so they don't run off to infinity
        bringToTop : function () {
            if (this.options.canBringToTop !== false && this.el.id !== CLMSUI.utils.BaseFrameView.staticLastTopID) {
                var sortArr = [];
                var activeDivs = d3.selectAll(".dynDiv").filter (function() {
                    return CLMSUI.utils.isZeptoDOMElemVisible ($(this));
                });
                console.log ("this view", this);

                // Push objects containing the individual divs as selections along with their z-indexes to an array
                activeDivs.each (function() {
                    // default z-index is "auto" on firefox, + on this returns NaN, so need || 0 to make it sensible
                    var zindex = d3.select(this).style("z-index"); //*/ d3.select(this).datum() ? d3.select(this).datum()("z-index") : 0;
                    zindex = zindex || 0;
                    sortArr.push ({z: zindex, selection: d3.select(this)});
                });
                // Sort that array by the z-index
                // Then reset the z-index incrementally based on that sort - stops z-index racing away to a number large enough to overwrite dropdown menus
                sortArr
                    .sort (function (a,b) {
                        return a.z > b.z ? 1 : (a.z < b.z ? -1 : 0);
                    })
                    .forEach (function (sorted, i) {
                        sorted.selection
                            .style ("z-index", i + 1)
                        ;
                    })
                ;
                // Make the current window top of this pile
                d3.select(this.el)
                    .style("z-index", sortArr.length + 1)
                ;

                CLMSUI.utils.BaseFrameView.staticLastTopID = this.el.id;    // store current top view as property of 'class' BaseFrameView (not instance of view)
                //console.log ("sortArr", sortArr);
            }
        },

        setVisible: function (show) {
            this.visible = show;
            d3.select(this.el)
                .style ('display', show ? 'block' : 'none')
                .classed ('dynDivVisible', show)
            ;

            if (show) {
                this
                    .relayout() // need to resize first sometimes so render gets correct width/height coords
                    .render()
                ;
                this.bringToTop();
            }
        },

        // Ask if view is currently visible in the DOM (use boolean for performance, querying dom for visibility often took ages)
        isVisible: function () {
            var start = window.performance.now();
            CLMSUI.utils.xilog (this.$el.toString(), "isVis start:", start);
            //var answer = CLMSUI.utils.isZeptoDOMElemVisible (this.$el);
            var answer = this.visible;
            CLMSUI.utils.xilog (this.$el, "isVis time:" + answer , (window.performance.now() - start));
            return answer;
        },

        // removes view
        // not really needed unless we want to do something extra on top of the prototype remove function (like destroy a c3 view just to be sure)
        remove: function () {
            // remove drag listener
            d3.select(this.el).selectAll(".draggableCorner").on(".drag", null);

            // this line destroys the containing backbone view and it's events
            Backbone.View.prototype.remove.call(this);
        },

        identifier: "Base",

        makeChartTitle: function (counts, colourScheme, titleElem, matchLevel) {
            var labels = colourScheme.isCategorical() ? colourScheme.get("labels").range() : [];
            var commaed = d3.format(",");
            var total = d3.sum (counts);
            var linkCountStr = counts.map (function (count, i) {
                return commaed(count)+" "+(labels[i] ? labels[i] : "Unknown");
            }, this);

            var titleText = this.identifier +": "+commaed(total)+(matchLevel ? " Matches - " : " Cross-Links - ")+linkCountStr.join(", ");

            titleElem.text (titleText);

            return this;
        },

        // return any relevant view states that can be used to label a screenshot etc
        optionsToString: function () {
            return "";
        },

        // Returns a useful filename given the view and filters current states
        filenameStateString: function () {
            return CLMSUI.utils.makeLegalFileName (CLMSUI.utils.searchesToString()+"--"+this.identifier+"-"+this.optionsToString()+"--"+CLMSUI.utils.filterStateToString());
        },
    },
    {
        staticLastTopID: 1, // stores id of last view which was 'brought to top' as class property. So I don't need to do expensive DOM operations sometimes.
    }),
};

CLMSUI.utils.ColourCollectionOptionViewBB = Backbone.View.extend ({
    initialize: function (options) {
        var self = this;
        d3.select(this.el).attr ("class", "btn selectHolder")
			.append ("span")
			.attr ("class", "noBreak")
			.html("<span class='rainbow'></span>Choose Cross-Link Colour Scheme ►")
        ;

        var addOptions = function (selectSel) {
            var optionSel = selectSel
                .selectAll("option")
                .data (self.model.toJSON())
            ;
            optionSel.exit().remove();
            optionSel.enter().append("option");
            optionSel
                .text (function (d) { return d.title; })
				.property ("value", function (d) { return d.id; })
				.attr ("title", function (d) { return d.longDescription; })
                .order()
            ;
        };

        d3.select(this.el).select("span.noBreak")
            .append("select")
            .attr("id", "linkColourSelect")
            .on ("change", function () {
                if (options.storeSelectedAt) {
                    var colourModel = self.model.at (d3.event.target.selectedIndex);
                    //CLMSUI.compositeModelInst.set("linkColourAssignment", colourModel);
                    options.storeSelectedAt.model.set (options.storeSelectedAt.attr, colourModel);
                }
            })
            .call (addOptions)
        ;

        if (options.storeSelectedAt) {
            this.listenTo (options.storeSelectedAt.model, "change:"+options.storeSelectedAt.attr, function (compModel, newColourModel) {
                //console.log ("colourSelector listening to change Link Colour Assignment", this, arguments);
                this.setSelected (newColourModel);
            });
        }

        this.listenTo (this.model, "update", function () {
            d3.select(this.el).select("select#linkColourSelect").call (addOptions);
        });

        return this;
    },

    setSelected: function (model) {
        d3.select(this.el)
            .selectAll("option")
            .property ("selected", function(d) {
                return d.id === model.get("id");
            })
        ;

        return this;
    }
});

CLMSUI.utils.sectionTable = function (domid, data, idPrefix, columnHeaders, headerFunc, rowFilterFunc, cellFunc, openSectionIndices, clickFunc) {
    var self = this;
    var setArrow = function (d) {
        var assocTable = d3.select("#"+idPrefix+d.id);
        d3.select(this).classed ("tableShown", assocTable.style("display") !== "none");
    };

    var dataJoin = domid.selectAll("section").data(data, function(d) { return d.id; });
    dataJoin.exit().remove();
    var newElems = dataJoin.enter().append("section").attr("class", "sectionTable");

    var newHeaders = newElems.append("h2")
        .on ("click", function(d) {
            var assocTable = d3.select("#"+idPrefix+d.id);
            var tableIsHidden = (assocTable.style("display") == "none");
            assocTable.style("display", tableIsHidden ? "table" : "none");
			if (clickFunc) { clickFunc (tableIsHidden, d); }
            setArrow.call (this, d);
        })
        //.on ("mouseover", function(d) {
            // eventually backbone shared highlighting code to go here?
			// except it's data specific, one table may show per protein, another links, another something else, so not doable here
        //})
    ;
    newHeaders.append("svg")
        .append("polygon")
            .attr("points", "2,1 16,8 2,15")
    ;
	newHeaders.append("span");
	dataJoin.selectAll("h2 > span").text(headerFunc);	// name may have changed for existing tables too

    var newTables = newElems.append("table")
        .html("<caption></caption><thead><tr><th></th><th></th></tr></thead><tbody></tbody>")
        .attr("id", function(d) { return idPrefix+d.id; })
		.style("display", function (d,i) {
			return !openSectionIndices || openSectionIndices.indexOf(i) >= 0 ? "table" : "none";
		})
    ;
	newTables.selectAll("thead th").data (function(d) { return d.columnHeaders || columnHeaders})
		.text (function (d) { return d; })
	;
	
	var tables = dataJoin.selectAll("table");

    // yet another cobble a table together function, but as a string
    var makeTable237 = function (arrOfObjs) {
        var t = "<table><tr>";
        var headers = d3.keys(arrOfObjs[0]);
        headers.forEach (function(h) {
            t+="<TH>"+h+"</TH>";
        });
        t += "</TR>";
        arrOfObjs.forEach (function (obj) {
            t += "<TR>";
            d3.values(obj).forEach (function(h) {
                t+="<TD>"+h+"</TD>";
            });
            t += "</TR>";
        });
        t += "</TABLE>";
        return t;
    };

    var arrayExpandFunc = function (d, entries) {
        var expandKeys = self.options.expandTheseKeys;
        var newEntries = entries.map (function (entry) {
			var subTableVals = d[entry.key];
			if ($.isPlainObject (subTableVals)) {	// convert object into array of objects that'll have Key/Value as headings
				subTableVals = d3.entries (subTableVals);
			}
            return (expandKeys && expandKeys.has(entry.key)) ?
                {key: entry.key, value: makeTable237 (subTableVals)} : entry
            ;
        });
        return newEntries;
    };

    var tbodies = tables.select("tbody");	// pushes table's 'd' (data)  down to the tbody child
    var rowJoin = tbodies.selectAll("tr")
		.data(function(d) { return arrayExpandFunc (d, rowFilterFunc (d)); }, function(d) { return d.key; })
	;
    rowJoin.exit().remove();
    var newRows = rowJoin.enter().append("tr");

    var cells = rowJoin.selectAll("td")
		.data(function(d) { return [{key: d.key, value: d.key}, {key: d.key, value: d.value}]; })
	;
	cells
        .enter()
        .append("td")
        .classed ("fixedSizeFont", function(d,i) { return self.options.fixedFontKeys && self.options.fixedFontKeys.has (d.key) && i; })
    ;
	rowJoin.selectAll("td").each(cellFunc);	// existing rows in existing tables may have seen data change

    dataJoin.selectAll("h2").each (setArrow);
};




CLMSUI.utils.c3mods = function () {
    var c3guts = c3.chart.internal.fn;
    var c3funcs = c3.chart.fn;

    c3guts.redrawMirror = c3guts.redraw;
    c3funcs.enableRedraw = function (enable, immediate) {
        c3guts.enableRedrawFlag = enable;
         console.log ("YO REDA", c3guts.enableRedrawFlag, this);
        if (immediate) {
            console.log ("YOOOO", c3guts.enableRedrawFlag, this);
            //c3guts.redraw.call (this);
        }
    };

    c3guts.redraw = function (options, transitions) {
        console.log ("this", this);
        var c3guts = c3.chart.internal.fn;
        this.accumulatedOptions = $.extend({}, this.accumulatedOptions, options || {});
        if (c3guts.enableRedrawFlag) {
            this.redrawMirror (this.accumulatedOptions, transitions);
            this.accumulatedOptions = {};
        }
        console.log ("accum", c3guts.enableRedrawFlag, this.accumulatedOptions);
    };
};
