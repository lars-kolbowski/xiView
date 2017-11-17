//		colour-slider
//		Copyright 2016 Rappsilber Laboratory
//
//    	This product includes software developed at
//    	the Rappsilber Laboratory (http://www.rappsilberlab.org/).
//
//		author: Colin Combe, Martin Graham
//		
//		ThreeColourSliderBB.js
//
//      A brush slider with three colours taken from an underlying colour scale passed in as the model

var CLMSUI = CLMSUI || {};

CLMSUI.ThreeColourSliderBB = Backbone.View.extend ({
    events: {
        "change input.subsetNumberFilter": "directInput",
        "keyup input.subsetNumberFilter": "directInputIfReturn",
        "mouseup input.subsetNumberFilter": "directInput",
    },
    
    initialize: function (options) {
        
        var self = this;
        var top = d3.select(this.el);
        
        top
            .classed ("verticalFlexContainer", true)
            .classed ("threeColourSlider", true)
        ;
        
        $(window).on("resize", function() { 
            self.resize().render(); 
        });

        
        this.cx = this.el.clientWidth;
        this.cy = this.el.clientHeight;

        var margin = _.extend ({top: 50, right: 50, bottom: 50, left: 50}, options.margin || {});
        var width = 140 - margin.left - margin.right;
        var sliderWidth = 50;
        
        this.height = this.cy - margin.top - margin.bottom;

        this.y = d3.scale.linear()
            .domain(options.domain || [0, 100])
            .range([this.height, 0])
        ;
        
        

        this.brush = d3.svg.brush()
            .y(this.y)
            .extent(options.extent || [40, 60])
            .on("brushstart", function () { self.brushstart(); })
            .on("brush", function () { self.brushmove(); })
            .on("brushend", function () { self.brushend(); })
        ;
        
        var cutoffs = [
            {class: "vmin"},
            {class: "vmax"},
        ];
        top.selectAll("input.subsetNumberFilter")
            .data (cutoffs)
            .enter()
            .append("input")
            .attr ({
                class: function(d) { return "subsetNumberFilter "+d.class; }, 
                type: "number",
                min: options.domain[0],
                max: options.domain[1],
                step: 0.1,
            })
        ;

        var svg = top.append("svg")
            //.attr("width", width + margin.left + margin.right)
            //.attr("height", this.height + margin.top)
            .append("g")
            //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        ;
        // http://stackoverflow.com/questions/13069446/simple-fill-pattern-in-svg-diagonal-hatching
        /*
        var hatchPattern = svg.append("pattern")
            .attr("id", this.el.id+"Hatch")
            .attr("patternUnits", "userSpaceOnUse")
            .attr ("width", 3)
            .attr ("height", 3)
        ;
        
        hatchPattern.append("rect")
            .attr({x: 0, y: 0, width :3, height : 3})
            .style ("fill", "#aaa")
        ;     
        hatchPattern.append("rect")
            .attr({x: 0, y: 0, width :1, height : 1})
            .style ("fill", "#ddd")
        ;
        hatchPattern.append("rect")
            .attr({x: 1, y: 1, width :1, height : 1})
            .style ("fill", "#777")
        ;
        */
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(-1,0)")
            .call(d3.svg.axis().scale(this.y).orient("left"))
        ;

        console.log ("this", this.model);
        // upper brush rectangles with colours from underlying scale
        this.upperRange = svg.append("rect").attr("x", 0).attr("y", /*-10*/ 0).attr("width", sliderWidth);
        this.lowerRange = svg.append("rect").attr("x", 0).attr("width", sliderWidth);
        this.textFormat = d3.format(".2f");
        
        var brushg = svg.append("g")
            .attr("class", "brush")
            .call(this.brush)
        ;

        // triangle handles
        brushg.selectAll(".resize")
            .append("path")
                .attr("transform", "translate("+sliderWidth+",0)")
                .attr("d", "M0 0 L20 20 L20 -20 z")
                //.style("fill", "url(#"+self.el.id+"Hatch)")
        ;
        
        // triangle highlighting bevel
        brushg.selectAll(".resize")
            .append("path")
                .attr ("class", "bevel")
                .attr("transform", "translate("+sliderWidth+",0)")
                .attr("d", "M0 0 L20 -20")
        ;
        
        // text values in bar
        brushg.selectAll(".resize")
            .append ("text")
                .attr("transform", function(d,i) {
                    return "translate(0,"+(-2 + (i*13))+")";
                })
                .attr ("class", "brushValueText")
                .text ("0")
        ;
        
        brushg.selectAll("rect")
            .attr("width", 50);
        
        this.brushg = brushg;
        
        this.brushmove();
        
        
        svg.append("text")
            .attr ("transform", "rotate(90) translate(0,-"+(sliderWidth+2)+")")
            .attr ("class", "threeColourSliderTitle")
            .text (options.title)
        ;
        
        // move min box to bottom of slider
        top.append (function() {
            return top.select("input.vmin").remove().node();
        });
        
        this.listenTo (this.model, "colourModelChanged", this.render); // if range  (or domain) changes in current colour model
        
        return this;
    },
    
    resize: function () {
        var d3el = d3.select(this.el);
        
        // changing y range automatically adjusts the extent, but we want to keep the same extent
        this.height = d3el.select("svg").node().clientHeight;
        var oldExtent = this.brush.extent();
        this.y.range ([this.height, 0]);
        this.brush.extent (oldExtent);
        this.brush (d3el.select(".brush"));

        return this;
    },
    
    render: function () {
        var s = this.brush.extent();
        var d3el = d3.select(this.el);
        
        this.height = d3el.select("svg").node().clientHeight;
        
        console.log ("this.height", this.height, d3el.select("svg"), "brush extent", s);

        var colRange = this.model.get("colScale").range();
        this.upperRange.attr("height", this.y(s[1]) /*+ 10*/).style("fill", colRange[2]);
        this.brushg.select(".extent").style ("fill", colRange[1]);
        this.lowerRange.attr("height", this.height - this.y(s[0])).attr("y", this.y(s[0])).style("fill", colRange[0]);

        var self = this;
        d3el.selectAll(".brushValueText")
            .text (function(d,i) { return self.textFormat(s[s.length - i - 1]); })
        ;
        
        var cutoffs = this.model.get("colScale").domain();
        d3el.select("input.vmin").property ("value", cutoffs[0]);
        d3el.select("input.vmax").property ("value", cutoffs[1]);
        return this;
    },
    
    show: function (show) {
        d3.select(this.el).style("display", show ? null : "none");
        if (show) { this.render(); }
        return this;
    },

	brushstart: function () { return this; },

	brushmove: function () {
        var s = this.brush.extent();
        this.model.setDomain ([s[0], s[1]]);    // this'll trigger a re-render due to the colourModelChanged listener above ^^^
        return this;     
	},

	brushend: function () { return this; },
       
    
    directInput: function (evt) {
        var target = evt.target;
        var value = +target.value;
        var isMin = d3.select(target).classed("vmin");
        var bounds = this.y.domain();
        console.log ("bounds", bounds);
        var s = this.brush.extent();
        var correct = 
            [bounds[0], isMin ? value : s[0], isMin ? s[1] : value, bounds[1]]
            .sort(function(a,b) { return a - b;})
            .slice (1,3)
        ;
        
        this.brush.extent (correct);
        this.brush (d3.select(this.el).select(".brush"));
        this.brushmove();
    },
    
    directInputIfReturn: function (evt) {
        if (evt.keyCode === 13) {
            this.directInput (evt);
        }
    }
});