var CLMSUI = CLMSUI || {};

var SpectrumViewWrapper = CLMSUI.utils.BaseFrameView.extend({
    
    events: function() {
      var parentEvents = CLMSUI.utils.BaseFrameView.prototype.events;
      if(_.isFunction(parentEvents)){
          parentEvents = parentEvents();
      }
      return _.extend({},parentEvents,{});
    },


	initialize: function (options) {
        console.log ("args", arguments, options);
        var myOptions = options.options;
        SpectrumViewWrapper.__super__.initialize.apply (this, arguments);
        
        var _html = ""
				+"<button id='reset'>Reset Zoom</button>"
				+"<button id='clearHighlights'>Clear Highlights</button>"
                +"<button id='spectrumExportSVG'>Export SVG</button>"
				+"<label>Change color scheme:</label>"
				+"<select id='colorSelector' style='display:inline-block;'></select>" 
                +"<br/>"
                +"<label>Lossy Labels<input id='lossyChkBx' type='checkbox'></label>"
				+"<label>Measure<input id='measuringTool' type='checkbox'></label>"
				+"<label>Move Labels<input id='moveLabels' type='checkbox'></label>"
				+"<form id='setrange' style='display:inline-block;'>m/z Range:"
					+"<input type='text' id='xleft' size='5'>"
					+"<input type='text' id='xright' size='5'>"
					+"<input type='submit' value='set range'>"
					+"<span id='range-error'></span>"
				+"</form>"
				+"<svg id='spectrumSVG' style='height:100%; width:100%;'></svg>"
				+"<div id='measureTooltip'></div>"
        ;
        
        d3.select(this.el)
            .append("div")
            .attr("id", myOptions.wrapperID)
            .html (_html)
        ;
        
        d3.select("#"+myOptions.wrapperID)
            .selectAll("button")
            .attr ("class", "btn btn-1 btn-1a")
        ;
        
        d3.select("#spectrumExportSVG").classed ("downloadButton", true);
        
        var colOptions = [
            {value: "RdBu", text: "Red & Blue"},
            {value: "BrBG", text: "Brown & Teal"},
            {value: "PiYG", text: "Pink & Green"},
            {value: "PRGn", text: "Purple & Green"},
            {value: "PuOr", text: "Orange & Purple"},
        ];
        d3.select("#colorSelector").selectAll("option").data(colOptions)
            .enter()
            .append("option")
            .attr ("value", function(d) { return d.value; })
            .text (function(d) { return d.text; })
        ;
	},
    
    relayout: function () {
        CLMSUI.vent.trigger ("resizeSpectrumSubViews", true);
        return this;
    },
});
