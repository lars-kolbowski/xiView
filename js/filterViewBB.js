//      a view of the filter model state
//
//      Martin Graham, Colin Combe, Rappsilber Laboratory, 2015
//
//      js/filterViewBB.js

var CLMSUI = CLMSUI || {};

CLMSUI.FilterViewBB = Backbone.View.extend({
    tagName: "span",
    className: "filterGroup",
    events: {
        "change input.modeToggle": "modeChanged",
        "click input.filterTypeToggle": "filter",
        "input input.filterTypeText": "textFilter",
        "click input.subsetToggleFilterToggle": "subsetToggleFilter",
        "keyup input.subsetNumberFilter": "subsetNumberFilter",
        "mouseup input.subsetNumberFilter": "subsetNumberFilter",
		"dblclick button.filterReset": function() { this.model.resetFilter(); },
    },

    initialize: function (viewOptions) {
        var defaultOptions = {
            modes: [
                {"label":"Manual", "id":"manualMode", tooltip: "Filter using cross-link metadata"},
                {"label":"FDR", "id":"fdrMode", tooltip: "Filter using a False Discovery Rate cutoff"},
            ],
            subsetToggles: [
                {"label":"Linear", "id":"linears", tooltip: "Show linear peptides"},
                {"label":"Cross-links", "id":"crosslinks", tooltip: "Show cross-links"},
                {"label":"Ambig.", "id":"ambig", tooltip: "Show ambiguous cross-links"},
                {"label":"Between", "id":"betweenLinks", tooltip: "Show cross-links between different proteins"},
                {"label":"Self", "id":"selfLinks", tooltip: "Show cross-links between the same protein"},
                {"label":"Homomult.", "id":"homomultimericLinks", tooltip: "Show cross-links with overlapping linked peptides "},
            ],
            subsetNumberFilters: [
                {"label":"AA apart", "id":"aaApart", min: 0, max: 999, tooltip: "Only show cross-links separated by at least N amino acids e.g. 10"},
                {"label":"Pep. length", "id":"pepLength", min: 1, max: 99, tooltip: "Only show cross-links where both linked peptides are at least N amino acids long e.g. 4"},
            ],
            validationStatusToggles: [
                {"label":"A", "id":"A"},
                {"label":"B", "id":"B"},
                {"label":"C", "id":"C"},
                {"label":"?", "id":"Q"},
                {"label":"Auto", "id":"AUTO", tooltip: "Show autovalidated cross-links"},
                {"label":"Unval.", "id":"unval", tooltip: "Show unvalidated cross-links"},
                {"label":"Decoy", "id":"decoys", tooltip: "Show decoy cross-links"},
            ],
            navigationFilters: [
                {"label":"Peptide", "id":"pepSeq", "chars":7, tooltip: "Filter to cross-links with matches involving a peptide including this AA sequence e.g. FAKR"},
                {"label":"Protein", "id":"protNames", "chars":7, tooltip: "Filter to cross-links involving a protein name/identifier/description including this text. Separate with commas, specify both linked proteins with hyphens e.g. RAT3, RAT1-RAT2"},
                {"label":"Charge", "id":"charge", "chars":1, tooltip: "Filter to cross-links with matches with this charge state e.g. 3"},
                {"label":"Run", "id":"runName","chars":5, tooltip: "Filter to cross-links with matches whose run name includes this text e.g. 07_Lumos"},
                {"label":"Scan", "id":"scanNumber", "chars":5, tooltip: "Filter to cross-links with matches with this (partial) scan number e.g. 44565"},
            ],
            navigationNumberFilters: [
                {"label":"Residue Pairs per PPI", "id":"urpPpi", min: 1, max: 99, tooltip: "Filter out protein-protein interactions with less than * supporting unique residue pairs"}
            ]
        };
        this.options = _.extend (defaultOptions, viewOptions.myOptions || {});

        var self = this;

        // this.el is the dom element this should be getting added to, replaces targetDiv
        var mainDivSel = d3.select(this.el);
		
		
		function initResetGroup () {
			var resetDivSel = mainDivSel.append("div").attr ("class", "filterControlGroup verticalFlexContainer");
			resetDivSel.append("p").attr("class", "smallHeading").text("Filter Bar");
			resetDivSel.append("button")
				.attr("class", "filterReset btn btn-1a btn-tight")
				.attr("title", "Double-click to reset filter to originally set values")
				.text("Reset")
			;
		}

		
		function initFilterModeGroup() {
			var modeDivSel = mainDivSel.append("div").attr ("class", "filterControlGroup")
										.attr ("id", "filterModeDiv");
			//~ modeDivSel.append("span").attr("class", "sideOn").text("MODE");
			var modeElems = modeDivSel.selectAll("div.modeToggles")
				.data(this.options.modes, function(d) { return d.id; })
				.enter()
				.append ("div")
				.attr ("class", "toggles")
				.attr("id", function(d) { return "toggles_" + d.id; })
				.attr ("title", function(d) { return d.tooltip ? d.tooltip : undefined; })
				.append ("label")
			;
			modeElems.append ("span")
				.text (function(d) { return d.label; })
			;
			modeElems.append ("input")
				.attr ("id", function(d) { return d.id; })
				.attr ("class", "modeToggle")
				.attr ("name", "modeSelect")
				.attr ("type", "radio")
				//.property ("checked", function(d) { return Boolean (self.model.get(d.id)); })
			;
		}


		function initLinkPropertyGroup () {
			var dataSubsetDivSel = mainDivSel.append("div").attr ("class", "filterControlGroup");
			var subsetToggles = dataSubsetDivSel.selectAll("div.subsetToggles")
				.data(this.options.subsetToggles, function(d) { return d.id; })
				.enter()
				.append ("div")
				.attr ("class", "toggles subsetToggles")
				.attr("id", function(d) { return "toggles_" + d.id; })
				.attr ("title", function(d) { return d.tooltip ? d.tooltip : undefined; })
				.append ("label")
			;
			subsetToggles.append ("span")
				.text (function(d) { return d.label; })
			;
			subsetToggles.append ("input")
				.attr ("id", function(d) { return d.id; })
				.attr ("class", "subsetToggleFilterToggle")
				.attr ("type", "checkbox")
				//.property ("checked", function(d) { return Boolean (self.model.get(d.id)); })
			;

			var subsetNumberFilters = dataSubsetDivSel.selectAll("div.subsetNumberFilterDiv")
				.data(this.options.subsetNumberFilters, function(d) { return d.id; })
				.enter()
				.append ("div")
				.attr ("class", "toggles subsetNumberFilterDiv")
				//.attr("id", function(d) { return "toggles_" + d.id; }) // not a toggle, change id?
				.attr ("title", function(d) { return d.tooltip ? d.tooltip : undefined; })
				.append ("label")
			;
			subsetNumberFilters.append ("span")
				.text (function(d) { return d.label; })
			;

			subsetNumberFilters.append("p").classed("cutoffLabel",true).append("span").html("&ge;");

			subsetNumberFilters.append ("input")
				.attr ({id: function(d) { return d.id; }, class: "subsetNumberFilter", type: "number",
							min: function(d) { return d.min; }, max: function(d) { return d.max; }})
				//.property ("value", function(d) { return self.model.get(d.id); })
			;
		}


		function initValidationGroup () {
			var validationDivSel = mainDivSel.append("div")
									.attr ("class", "filterControlGroup")
									.attr ("id", "validationStatus");
			var validationElems = validationDivSel.selectAll("div.validationToggles")
				.data(this.options.validationStatusToggles, function(d) { return d.id; })
				.enter()
				.append ("div")
				.attr ("class", "toggles validationToggles")
				.attr("id", function(d) { return "toggles_" + d.id; })
				.attr ("title", function(d) { return d.tooltip ? d.tooltip : undefined; })
				.append ("label")
			;

			validationElems.append ("span")
				.text (function(d) { return d.label; })
			;

			validationElems.append ("input")
				.attr ("id", function(d) { return d.id; })
				.attr ("class", function(d) { return d.special ? "subsetToggleFilterToggle" : "filterTypeToggle"; })
				.attr ("type", "checkbox")
				//.property ("checked", function(d) { return Boolean (self.model.get(d.id)); })
			;
		}

		
		function initScoreFilterGroup () {
			var cutoffDivSel = mainDivSel.append ("div")
									.attr("class", "filterControlGroup")
									.attr("id", "matchScore");
				  //~ cutoffDivSel.append("span").attr("class", "sideOn").text("CUTOFF");

			var sliderSection = cutoffDivSel.append ("div").attr("class", "scoreSlider");
			// Can validate template output at http://validator.w3.org/#validate_by_input+with_options
			var tpl = _.template ("<div><p>Match score</p><P class='vmin cutoffLabel'><span>&gt;</span></P><P>Min</P></div><div id='<%= eid %>'></div><div><p>Match score</p><P class='cutoffLabel vmax'><span>&lt;</span></P><P>Max</P></div>");
			sliderSection.html (tpl ({eid: self.el.id+"SliderHolder"}));
			// sliderSection.style('display', (self.model.get("scores") === null) ? 'none' : null);
			sliderSection.selectAll("p.cutoffLabel")
				.attr ("title", function () {
					var isMinInput = d3.select(this).classed("vmin");
					return "Filter out matches with scores "+(isMinInput ? "less than": "greater than")+" X e.g. "+(isMinInput ? "8.0": "20.0");
				})
				.append("input")
				.attr({
					type: "number",
					step: 0.1,
					//min: 0,
				})
				.property ("value", function () {
					var isMinInput = d3.select(this.parentNode).classed("vmin");
					var cutoff = self.model.get("matchScoreCutoff");
					var val = cutoff [isMinInput ? 0 : 1];
					return val !== undefined ? val : "";
				})
				.on ("change", function() { // "input" activates per keypress which knackers typing in anything >1 digit
					//console.log ("model", self.model);
					var val = +this.value;
					var isMinInput = d3.select(this.parentNode).classed("vmin");
					var cutoff = self.model.get("matchScoreCutoff");
					var scoreExtent = self.model.scoreExtent;
					// take new values, along with score extents, sort them and discard extremes for new cutoff settings
					var newVals = [isMinInput ? val : (cutoff[0] !== undefined ? cutoff[0] : scoreExtent[0]),
								   isMinInput ? (cutoff[1] !== undefined ? cutoff[1] : scoreExtent[1]) : val,
								   scoreExtent[0], scoreExtent[1]]
						.filter (function (v) { return v !== undefined; })
						.sort(function(a,b) { return a - b;})
					;
					//console.log ("newVals", newVals);
					newVals = newVals.slice ((newVals.length / 2) - 1, (newVals.length / 2) + 1);

					self.model.set("matchScoreCutoff", newVals);
				})
			;
		}

		
		function initFDRPlaceholder() {
			//following may not be best practice, its here to get the placeholder divs in the right place in the filter div (the grey bar at bottom)
			mainDivSel.append ("div")
				.attr("class", "filterControlGroup")
				.attr("id", "fdrPanel")
			;
		}
		

		function initNavigationGroup () {
			var navDivSel = mainDivSel.append ("div")
				.attr("class", "filterControlGroup")
				.attr("id", "navFilters")
			;
			//~ navDivSel.append("span").attr("class", "sideOn").text("NAVIGATION");

			var textFilters = navDivSel.selectAll("div.textFilters")
				.data(this.options.navigationFilters, function(d) { return d.id; })
				.enter()
				.append("div")
				.attr("class", "textFilters")
				.attr ("title", function(d) { return d.tooltip ? d.tooltip : undefined; })
				.append ("label")
			;
			textFilters.append("span")
				.text (function(d) { return d.label; })
			;
			textFilters.append ("input")
				.attr ("id", function(d) { return d.id; })
				.attr ("class", "filterTypeText")
				.attr ("type", "textbox")
				.attr ("size", function(d) { return d.chars; })
				//.property ("value", function(d) { return self.model.get(d.id); })
			;
		}
		
		
		function initNavigationGroup2 () {
			var navNumberDivSel = mainDivSel.append ("div")
				.attr("class", "filterControlGroup")
				.attr("id", "navNumberFilters")
			;
			var navigationNumberFilters = navNumberDivSel.selectAll("div.navNumberFilterDiv")
				.data(this.options.navigationNumberFilters, function(d) { return d.id; })
				.enter()
				.append ("div")
				.attr ("class", "navNumberFilterDiv")
				.attr ("title", function(d) { return d.tooltip ? d.tooltip : undefined; })
				.append ("label")
			;
			navigationNumberFilters.append ("span")
				.style("display", "block")
				.text (function(d) { return d.label; })
			;
			navigationNumberFilters.append("p").classed("cutoffLabel",true).append("span").html ("&ge;");
			navigationNumberFilters.append ("input")
				.attr ({id: function(d) { return d.id; }, class: "subsetNumberFilter", type: "number",
							min: function(d) { return d.min; }, max: function(d) { return d.max; }})
				//.property ("value", function(d) { return self.model.get(d.id); })
			;
		}

		initResetGroup.call (this);
		initFilterModeGroup.call (this);
		initLinkPropertyGroup.call (this);
		initValidationGroup.call (this);
		initScoreFilterGroup.call (this);
		initFDRPlaceholder.call (this);
		initNavigationGroup.call (this);
		initNavigationGroup2.call (this);

        // hide toggle options if no point in them being there (i.e. no between / self link toggle if only 1 protein)
        if (this.options.hide) {
            var entries = d3.entries(this.options.hide);
            var hideEntries = entries.filter (function (entry) { return entry.value; });
            var hideEntrySet = d3.set (_.pluck (hideEntries, "key"));
            mainDivSel.selectAll(".subsetToggles,.validationToggles,.textFilters")
                .filter (function(d) { return hideEntrySet.has (d.id); })
                .style ("display", "none")
            ;
        }

        this.displayEventName = viewOptions.displayEventName;

        this.listenTo (this.model, "change:matchScoreCutoff", function (model, val) {
            mainDivSel.select(".vmin input").property("value", val[0]); // min label
            mainDivSel.select(".vmax input").property("value", val[1]); // max label
        });

		this.listenTo (this.model, "change", this.setInputValuesFromModel);

        mainDivSel.selectAll(".filterControlGroup").classed("noBreak", true);

		this.model.trigger ("change", this.model, {showHide: true});	// Forces first call of setInputValuesFromModel
		this.modeChanged();
    },

    filter: function (evt) {
        var target = evt.target;
        console.log ("filter set", target.id, target.checked);
        this.model.set (target.id, target.checked);
    },

    textFilter: function (evt) {
        var target = evt.target;
        console.log ("filter set", target.id, target.value);
        this.model.set (target.id, target.value);
    },

    subsetToggleFilter: function (evt) {
        console.log ("subsetToggleFilter", evt);
        var target = evt.target;
        var id = target.id;
        if (id == "selfLinks"){
			d3.select("#aaApart").attr("disabled", target.checked ? null : "disabled");
		}
        this.model.set (id, target.checked);
    },

    sliderDecimalPlaces: 2,

    subsetNumberFilter: function (evt) {
		var target = evt.target;
        var id = target.id;
        var value = target.value;
        if (this.model.get (id) != value) {
			console.log ("subsetNumberFilter:", id, value);
			this.model.set (id, value);
		}
    },

    modeChanged: function () {
		var fdrMode = d3.select("#fdrMode").node().checked;
		this.model.set ({fdrMode: fdrMode, manualMode: !fdrMode});
    },
	
	setInputValuesFromModel: function (model, options) {
		options = options || {};
		model = model || this.model;
		
		var mainDiv = d3.select(this.el);
		
		mainDiv.selectAll("input.filterTypeText, input.subsetNumberFilter")
			.property ("value", function(d) { return model.get(d.id); })
		;
		
		mainDiv.selectAll("input.subsetToggleFilterToggle, input.modeToggle, input.filterTypeToggle")
			.property ("checked", function (d) { return Boolean (model.get(d.id)); })
		;
		
		// hide parts of the filter panel if mode (manual/fdr) setting has changed, or if setInputValuesFromModelcalled directly (change is empty)
		if (options.showHide || model.changed.manualMode !== undefined || model.changed.fdrMode !== undefined) {
			var fdrMode = model.get("fdrMode");
			d3.selectAll("#validationStatus, #matchScore").style("display", fdrMode ? "none" : null);
			d3.selectAll("#fdrPanel").style("display", fdrMode ? null : "none");
			if (fdrMode == true) {
				this.model.set("ambig", false);
			}
			d3.select("#ambig").property("disabled", fdrMode == true);
		}
	},

    render: function () {
        return this;
    }
});


CLMSUI.FDRViewBB = Backbone.View.extend  ({
    initialize: function () {

        var chartDiv = d3.select(this.el);
        chartDiv.html ("<div class='fdrCalculation'><p>Basic link-level FDR calculation</p><span></span></div>");
        var self = this;
        var options = [0.01, 0.05, 0.1, 0.2, 0.5/*, undefined*/];
        var labelFunc = function (d) { return d === undefined ? "Off" : d3.format("%")(d); };

        chartDiv.select("span").selectAll("label.fixed").data(options)
            .enter()
            .append("label")
            .classed ("horizontalFlow fixed", true)
                .append ("span")
                .attr ("class", "noBreak")
                .text(labelFunc)
                .append("input")
                    .attr("type", "radio")
                    .attr("value", function(d) { return d; })
                    .attr("name", "fdrPercent")
                    .on ("click", function(d) {
                        self.model.set("fdrThreshold", d);
                    })
        ;

        chartDiv.select("span")
            .append("label")
            .attr("class", "horizontalFlow noBreak2")
                .append ("span")
                .attr ("class", "noBreak")
                .text("Other %")
                .append("input")
                    .attr("type", "number")
                    .attr("min", 0)
                    .attr("max", 100)
                    .attr("step", 1)
					.attr ("class", "fdrValue")
                    .on ("change", function() { // "input" activates per keypress which knackers typing in anything >1 digit
                        self.model.set("fdrThreshold", (+this.value) / 100);
                    })
        ;
		
		this.listenTo (this.model, "change:fdrThreshold", this.setInputValuesFromModel);
		this.model.trigger ("change:fdrThreshold", this.model);

        return this;
    },
	
	setInputValuesFromModel: function (model) {
		model = model || this.model;
		var fdrThreshold = model.get("fdrThreshold");
		var d3el = d3.select(this.el);
		d3el.style ("display", model.get("fdrMode") ? null : "none");
		d3el.selectAll("input[name='fdrPercent']").property("checked", function(d) { return d === fdrThreshold; });
		d3el.selectAll(".fdrValue").property("value", function() { return fdrThreshold * 100; });
	}
});

CLMSUI.FilterSummaryViewBB = Backbone.View.extend({
    events: {},

    initialize: function () {
        var targetTemplateString = "Post-Filter: <strong><%= targets %></strong> of <%= possible %> TT Cross-Links";
        this.targetTemplate = _.template (targetTemplateString);
        this.allTemplate = _.template (targetTemplateString+" ( + <%= decoysTD %> TD; <%= decoysDD %> DD Decoys)");

        this.listenTo (this.model, "filteringDone", this.render)
            .render()
        ;
    },

    render: function () {
        var commaFormat = d3.format(",");
        var model = this.model;
        var decoysPresent = model.get("clmsModel").get("decoysPresent");
        var variables = {
            targets: commaFormat (model.getFilteredCrossLinks().length),
			decoysTD: commaFormat (model.getFilteredCrossLinks("decoysTD").length),
			decoysDD: commaFormat (model.getFilteredCrossLinks("decoysDD").length),
			possible: commaFormat (model.get("TTCrossLinkCount"))
		};

        d3.select(this.el).html ((decoysPresent ? this.allTemplate : this.targetTemplate) (variables));
        return this;
    },
});

CLMSUI.FDRSummaryViewBB = Backbone.View.extend({
    events: {},

    initialize: function () {
        var fdrTypes = ["interFdrCut", "intraFdrCut"];
        d3.select(this.el).selectAll("p").data(fdrTypes)
            .enter()
            .append("p")
            .attr("class", function(d) { return d+"Elem"; })
        ;

        this.pctFormat = d3.format("%");

        this.listenTo (this.model, "filteringDone", this.render)
            .render()
        ;
    },

    render: function () {
        var fdrTypes = {"interFdrCut": "Between", "intraFdrCut": "Within"};

        var filterModel = this.model.get("filterModel");
        var threshold = filterModel.get("fdrThreshold");
        var fdrMode = filterModel.get("fdrMode");

        var clmsModel = this.model.get("clmsModel");
        var singleTargetProtein = clmsModel.targetProteinCount < 2;
        var decoysPresent = clmsModel.get("decoysPresent");

        var self = this;

        d3.select(this.el).selectAll("p")
            .text (function (d, i) {
                if (fdrMode) {
                    var cut = filterModel.get(d);
                    return "• "+fdrTypes[d]+" score cutoff for "+self.pctFormat(threshold)+" is "+(cut ? cut.toFixed(2) : cut);
                } else {
                    if (i === 0 && decoysPresent) {
                        var roughFDR = (self.model.getFilteredCrossLinks("decoysTD").length - self.model.getFilteredCrossLinks("decoysDD").length) / (self.model.getFilteredCrossLinks().length || 1);
                        return "• Rough FDR Equivalent = "+self.pctFormat(roughFDR);
                    }
                    return "";
                }
            })
            // Hide between protein score if only 1 real protein (will always be an undefined score)
            .style ("display", function(d) {
                return fdrMode && decoysPresent && d === "interFdrCut" && singleTargetProtein ? "none" : null;
            })
        ;

        return this;
    },
});
