<!--
//  CLMS-UI
//  Copyright 2015 Colin Combe, Rappsilber Laboratory, Edinburgh University
//
//  This file is part of CLMS-UI.
//
//  CLMS-UI is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  CLMS-UI is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with CLMS-UI.  If not, see <http://www.gnu.org/licenses/>.
-->
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
        
        <meta http-equiv="cache-control" content="max-age=0" />
        <meta http-equiv="cache-control" content="no-cache" />
        <meta http-equiv="expires" content="0" />
        <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
        <meta http-equiv="pragma" content="no-cache" />
        
		<meta name="description" content="common platform for downstream analysis of CLMS data" />
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black">

		<link rel="stylesheet" href="./css/reset.css" />
		<link rel="stylesheet" type="text/css" href="./css/byrei-dyndiv_0.5.css">
		<link rel="stylesheet" href="./css/style.css" />
		<link rel="stylesheet" href="./css/xiNET.css">
        
        <link rel="stylesheet" href="./css/matrix.css">
        <link rel="stylesheet" href="./css/c3.css">

		<script type="text/javascript" src="./vendor/signals.js"></script>
        <script type="text/javascript" src="./vendor/byrei-dyndiv_1.0rc1-src.js"></script>
        <script type="text/javascript" src="./vendor/d3.js"></script>
        <script type="text/javascript" src="./vendor/colorbrewer.js"></script>
       	<script type="text/javascript" src="./vendor/rgbcolor.js"></script>
		
		<script type="text/javascript" src="./vendor/ngl.embedded.min.js"></script>
		<script type="text/javascript" src="./vendor/crosslink.js"></script>
		
		<!-- <script type="text/javascript" src="./vendor/DistanceSlider.js"></script> -->

		<script type="text/javascript" src="./vendor/spectrum.js"></script>
        <!--spectrum dev
        <script type="text/javascript" src="../spectrum/src/SpectrumViewer.js"></script>
        <script type="text/javascript" src="../spectrum/src/FragmentationKey.js"></script>
        <script type="text/javascript" src="../spectrum/src/graph/Graph.js"></script>
        <script type="text/javascript" src="../spectrum/src/graph/Peak.js"></script>
        <script type="text/javascript" src="../spectrum/src/graph/Fragment.js"></script>-->
		
		<script type="text/javascript" src="./vendor/crosslinkviewer.js"></script>
        <!--xiNET dev
        <script type="text/javascript" src="../crosslink-viewer/src/controller/Init.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/controller/MouseEvents.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/controller/TouchEvents.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/controller/Layout.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/controller/Refresh.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/controller/ToolTips.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/model/Match.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/model/Link.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/model/Protein.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/model/Annotation.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/model/ProteinLink.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/model/ResidueLink.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/controller/ExternalControls.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/controller/Rotator.js"></script>
        <script type="text/javascript" src="../crosslink-viewer/src/controller/xiNET_Storage.js"></script> -->
               
        <!-- <script type="text/javascript" src="../distogram/distogram.js"></script> -->
        <script type="text/javascript" src="./vendor/c3.js"></script>
        <script type="text/javascript" src="./vendor/underscore.js"></script>
        <script type="text/javascript" src="./vendor/zepto.js"></script>
        <script type="text/javascript" src="./vendor/backbone.js"></script>
        
        <!-- Backbone models/views loaded after Backbone itself, otherwise need to delay their instantiation somehow -->
        <script type="text/javascript" src="./js/Utils.js"></script>
        <script type="text/javascript" src="./js/modelUtils.js"></script>
        <script type="text/javascript" src="./vendor/distogramBB.js"></script>
        <script type="text/javascript" src="./vendor/DistanceSliderBB.js"></script>
        <script type="text/javascript" src="./js/FilterViewBB.js"></script>
        <script type="text/javascript" src="./js/FilterModelBB.js"></script>
        <script type="text/javascript" src="./js/matrix.js"></script>
    </head>
    <body>
<!--
		<div class="dynDiv_setLimit">
-->

			<div class="dynDiv" id="keyPanel">
				<div class="dynDiv_moveParentDiv"><i class="fa fa-times-circle" onclick="showKeyPanel(false);"></i></div>
				<div class="panelInner">
					<div id="key"><img id="defaultLinkKey" src="./images/fig3_1.svg"><br><img id="logo" src="./images/logos/rappsilber-lab-small.png"></div>
				</div>					
				<div class="dynDiv_resizeDiv_tl"></div>
				<div class="dynDiv_resizeDiv_tr"></div>
				<div class="dynDiv_resizeDiv_bl"></div>
				<div class="dynDiv_resizeDiv_br"></div>
			</div>

			<div class="dynDiv helpPanel" id="helpPanel">
				<div class="dynDiv_moveParentDiv"><i class="fa fa-times-circle" onclick="showHelpPanel(false);"></i></div>
				<div class="panelInner">
					<?php include "./php/help.php" ?>
				</div>
				<div class="dynDiv_resizeDiv_tl"></div>
				<div class="dynDiv_resizeDiv_tr"></div>
				<div class="dynDiv_resizeDiv_bl"></div>
				<div class="dynDiv_resizeDiv_br"></div>
			</div>

			<div class="dynDiv" id="nglPanel">
				<div class="dynDiv_moveParentDiv"><i class="fa fa-times-circle" onclick="showNglPanel(false);"></i></div>
				
				<div style="height:40px;">
					<label  class="btn">Distance labels
						<input id="distChkBx" 
							onclick="spectrumViewer.showLossy(document.getElementById('distChkBx').checked)" 
						type="checkbox">
					</label>
					<button class="btn btn-1 btn-1a" onclick="stage.resize();">Reset zoom</button>
					<button class="btn btn-1 btn-1a" onclick="downloadNGLImage();">Download image</button>
					
				</div>
				
				<div class="panelInner" id='nglDiv'></div>
				<div class="dynDiv_resizeDiv_tl"></div>
				<div class="dynDiv_resizeDiv_tr"></div>
				<div class="dynDiv_resizeDiv_bl"></div>
				<div class="dynDiv_resizeDiv_br"></div>
			</div>			
			
			<div class="dynDiv" id="spectrumPanel">
				<div class="dynDiv_moveParentDiv"><i class="fa fa-times-circle" onclick="showSpectrumPanel(false);selectionPanel.clearTableHighlights();"></i></div>

				<div style="height:40px;">
					<label  class="btn">loss labels
						<input id="lossyChkBx" 
							onclick="spectrumViewer.showLossy(document.getElementById('lossyChkBx').checked)" 
						type="checkbox">
					</label>
					<button class="btn btn-1 btn-1a" onclick="spectrumViewer.resize();">Reset zoom</button>
					<button class="btn btn-1 btn-1a" onclick="downloadSpectrumSVG();">Download image</button>
					
				</div>

				
				<div class="panelInner">
					<div  id='spectrumDiv'></div>
				</div> 
				<div class="dynDiv_resizeDiv_tl"></div>
				<div class="dynDiv_resizeDiv_tr"></div>
				<div class="dynDiv_resizeDiv_bl"></div>
				<div class="dynDiv_resizeDiv_br"></div>
			</div>
			
        
            <div class="dynDiv" id="distoPanel">
				<!-- <div class="dynDiv_moveParentDiv"><i class="fa fa-times-circle" id="distoHide" onclick="showDistoPanel(false);"></i></div> -->
				<!--
				<div style="height:40px;">
					<button class="btn btn-1 btn-1a" id="distoDownload">Download image</button>			
				</div>
                -->
				
				<!-- <div class="panelInner" id='distoDiv'></div> -->
                <!--
                    <div class="dynDiv_resizeDiv_tl"></div>
                    <div class="dynDiv_resizeDiv_tr"></div>
                    <div class="dynDiv_resizeDiv_bl"></div>
                    <div class="dynDiv_resizeDiv_br"></div>
                -->
			</div>	
        
            <div class="dynDiv" id="matrixPanel">
            </div>

			
<!--
		</div>
-->

		<!-- Main -->
		<div id="main">

			<div class="container">
				<h1 class="page-header">
					<i class="fa fa-home" onclick="window.location = './history.php';" title="Return to search history"></i>
<!--
					http://pterkildsen.com/2014/07/13/styling-a-group-of-checkboxes-as-a-dropdown-via-css-and-javascript/
-->

					<p class="btn">Layout:</p>
					<button class="btn btn-1 btn-1a" id="save" onclick="saveLayout();">Save</button>
<!--
					<button class="btn btn-1 btn-1a" onclick="xlv.reset();">Reset</button>
-->
					<p class="btn">Download:</p>
					<button class="btn btn-1 btn-1a" onclick="downloadLinks();">Links</button>
					<button class="btn btn-1 btn-1a" onclick="downloadMatches();">Matches</button>
					<button class="btn btn-1 btn-1a" onclick="downloadResidueCount();">Residues</button>
					<button class="btn btn-1 btn-1a" onclick="downloadSVG();">Image</button>
					<label class="btn">Legend
							<input id="keyChkBx" onclick="showKeyPanel(this.checked);" type="checkbox"></label>
					<!-- <label class="btn" style="margin-left:20px;padding-left:0px;">Selection
							<input checked id="selectionChkBx" onclick="showSelectionPanel(this.checked)" type="checkbox"></label> -->
					<label id="nglCbLabel" class="btn" style="padding-left:0px;">3D
							<input id="nglChkBx" onclick="showNglPanel(this.checked);" type="checkbox"></label>
                    <!--
                    <label id="distoCbLabel" class="btn" style="padding-left:0px;">Distogram
							<input id="distoChkBx" onclick="showDistoPanel(this.checked);" type="checkbox"></label>
                    -->
                    <span id="distoChkBxPlaceholder"></span>
                    <span id="matrixChkBxPlaceholder"></span>
					<label class="btn" style="padding-left:0px;">Help
							<input id="helpChkBx" onclick="showHelpPanel(this.checked)" type="checkbox"></label>
                    
				</h1>
   	 		</div>

			<div>
				<div id="topDiv"></div>
				<div id=splitterDiv class="horizontalSplitter"></div>
				<div id="bottomDiv">
					<div id="selectionDiv" class="panelInner">
						<p>No selection.</p>
						<p>To hide this panel click the X in its top right corner or uncheck the selection checkbox in the top right of the window. </p>
					</div>
				</div>
			</div>

			<div class="controls">
                    <span id="filterPlaceholder"></span>
                          <!--
					<label>A
						<input checked="checked"
								   id="A"
								   onclick="CLMSUI.filterFunc();"
								   type="checkbox"
							/>
					</label>
					<label>B
						<input checked="checked"
								   id="B"
								   onclick="CLMSUI.filterFunc();"
								   type="checkbox"
							/>
					</label>
					<label>C
						<input checked="checked"
								   id="C"
								   onclick="CLMSUI.filterFunc();"
								   type="checkbox"
							/>
					</label>
					<label>?
						<input id="Q"
								   onclick="CLMSUI.filterFunc();"
								   type="checkbox"
							/>
					</label>
					<label>auto
						<input id="AUTO"
								   onclick="CLMSUI.filterFunc();"
								   type="checkbox"
							/>
					</label>
                        -->
                    <!--
					<div id="scoreSlider">
						<p class="scoreLabel" id="scoreLabel1"></p>
						<input id="slide" type="range" min="0" max="100" step="1" value="0" oninput="sliderChanged()"/>
						<p class="scoreLabel" id="scoreLabel2"></p>
						<p id="cutoffLabel">(cut-off)</p>
					</div> 
                    -->
                    <!-- outlined scoreSlider -->
                
					<div style='float:right'>
                        <!--
						<label>Self-Links
							<input checked="checked"
								   id="selfLinks"
								   onclick="//xlv.showSelfLinks(document.getElementById('selfLinks').checked)"
								   type="checkbox"
							/>
						</label>
						<label>&nbsp;&nbsp;Ambiguous
							<input checked="checked"
								   id="ambig"
								   onclick="//xlv.showAmbig(document.getElementById('ambig').checked)"
								   type="checkbox"
							/>
						</label>
                        -->
						<label style="margin-left:20px;">Annotations:
							<select id="annotationsSelect" onChange="changeAnnotations();">
								<option>None</option>
								<option selected>Custom</option>
								<option>UniprotKB</option>
								<option>SuperFamily</option>
								<option>Lysines</option>
							</select>
						</label>						
<!--
						<label style="margin-left:20px;">Link colours:
-->
							<select id="linkColourSelect" onChange="changeLinkColours();">
								<option selected>SAS dist.</option>
								<option>Euc. dist.</option>
								<option>Search</option>
							</select>
<!--
						</label>
-->
					</div>
				</div>
			</div>

		</div><!-- MAIN -->
        

        <script>	
		//<![CDATA[
			
			"use strict";
			
            var CLMSUI = CLMSUI || {};
            
            // http://stackoverflow.com/questions/11609825/backbone-js-how-to-communicate-between-views
            CLMSUI.vent = {};
            _.extend (CLMSUI.vent, Backbone.Events);
            
			            
            
			//showSelectionPanel(false);	
			// for NGL
			NGL.mainScriptFilePath = "./vendor/ngl.embedded.min.js";  
			var stage;
			// for xiNET
			var tempModelMaker;
            
            var targetDiv = document.getElementById('topDiv');
				
            tempModelMaker = new xiNET.Controller(targetDiv);
            <?php
                include './php/loadData.php';
                if (file_exists('../annotations.php')){
                    // include '../annotations.php';
                }
            ?>

            CLMSUI.clmsModel = Backbone.Model.extend();
            CLMSUI.clmsModelInst = new CLMSUI.clmsModel ({ 
                    interactors: tempModelMaker.proteins, 
                    proteinLinks: tempModelMaker.proteinLinks
            });

            CLMSUI.distancesModel = Backbone.Model.extend({
                flattenedDistances: function () {
                    return CLMSUI.modelUtils.flattenDistanceMatrix (this.get("distances"));
                }
            });
            CLMSUI.distancesInst = new CLMSUI.distancesModel ({});
            /*
            CLMSUI.distancesInst.listenTo (CLMSUI.distancesInst, "change:distances", function (model, newDistances) {
                console.log ("model calling own flattenedDistances set method");
                model.set ("flattenedDistances", CLMSUI.modelUtils.flattenDistanceMatrix (newDistances));
            });
            */
            CLMSUI.distancesInst.set("distances", distances);
            
            CLMSUI.filterModelInst = new CLMSUI.FilterModelBB ({
                scores: tempModelMaker.scores
            });
            
            console.log ("CLMSUI", CLMSUI, "xinet", tempModelMaker);

			//~ https://thechamplord.wordpress.com/2014/07/04/using-javascript-window-onload-event-properly/
			window.addEventListener("load", function() {
				
            
                // Showing multiple searches at once
				var s = d3.map(CLMSUI.searchesShown);
				var title = s.keys().toString() + " : " + s.values().toString();//JSON.stringify(searchesShown);
				document.title = title;
				
				if (s.keys().length > 1) {
					showKeyPanel(true);
					document.getElementById('save').setAttribute('style','display:none;');
				}
                

                var filterViewGroup = new CLMSUI.FilterViewBB ({
                    el: "#filterPlaceholder", 
                    model: CLMSUI.filterModelInst,
                    events: {}
                });
                
                // Generate distogram checkbox view here
                CLMSUI.utils.addCheckboxBackboneView (d3.select("#distoChkBxPlaceholder"), {label:"Distogram", eventName:"distoShow"});
                CLMSUI.utils.addCheckboxBackboneView (d3.select("#matrixChkBxPlaceholder"), {label:"Matrix", eventName:"matrixShow"});
				
				if (HSA_Active){
						
					/*Distance slider */
					var distSliderDiv = d3.select(targetDiv).append("div").attr("id","sliderDiv");
      
					var distSlider = new CLMSUI.DistanceSliderBB ({el: "#sliderDiv", model: CLMSUI.rangeModelInst });
					distSlider.brushMoved.add(onDistanceSliderChange); //add listener
                    distSlider.brushmove();

					//distSlider.brushMoved.add(onDistanceSliderChange3D); //add listener
					//var scale = d3.scale.threshold()
					//	.domain([0, 15, 25])
					//	.range(distSlider.colourRange.slice(0));   // nasty access of view data, but only have to do it until xlv is backboned. Edit: Actually can ignore now.
					//onDistanceSliderChange(scale);
                    //CLMSUI.rangeModelInst.set ("scale", scale);
                    
                    //var stats = d3.select(this.targetDiv).append("div").attr("id","statsDiv");
					//distoViewer.setData(xlv.distances,xlv);				
				}
				else {
					document.getElementById('nglCbLabel').setAttribute('style','display:none;');
					document.getElementById('distoChkBxPlaceholder').setAttribute('style','display:none;');
                    document.getElementById('matrixChkBxPlaceholder').setAttribute('style','display:none;');
				}		
				document.getElementById('linkColourSelect').setAttribute('style','display:none;');
					
                /*
				CLMSUI.filterFunc = function () {
                    //xlv.checkLinks(); // needs fixed.
                    distoViewer.render ();
                }
                */
                
                /*
                
				//register callbacks
				xlv.linkSelectionCallbacks.push(selectionPanel.updateTable);

				xlv.legendCallbacks.push(function (linkColours, domainColours) {
					var coloursKeyDiv = document.getElementById('key');
					if ((linkColours && linkColours.domain().length > 0) || (domainColours && domainColours.domain().length > 0)){
						var table = "<table>";
						var domain, range;
						if (linkColours){
							domain = linkColours.domain();
							range = linkColours.range();
							for (var i = 0; i < domain.length; i ++){
								var temp = new RGBColor(range[i%20]);
								table += "<tr><td style='padding:5px;width:70px;'><div style='width:60px;height:3px;background:"
										+ temp.toRGB() + ";'></div></td><td>"
										+ xlv.searchesShown[domain[i]] +"</td></tr>";
							}	
							table += "<tr><td style='padding:5px;width:70px;'><div style='width:60px;height:3px;background:"
										+ "#000;" + ";'></div></td><td>"
										+ "Not unique" +"</td></tr>";
							
						}
						if (domainColours) {
							domain = domainColours.domain();
							range = domainColours.range();
							//table += "<tr style='height:10px;'></tr>";
							for (var i = 0; i < domain.length; i ++){
								//make opaque version of transparent colour on white
								//~ http://stackoverflow.com/questions/2049230/convert-rgba-color-to-rgb
								var temp = new RGBColor(range[i%20]);
								var opaque = {};
								opaque.r = ((1 - 0.6) * 1) + (0.6 * (temp.r / 255));
								opaque.g = ((1 - 0.6) * 1) + (0.6 * (temp.g / 255));
								opaque.b = ((1 - 0.6) * 1) + (0.6 * (temp.b / 255));
								var col = "rgb(" +Math.floor(opaque.r * 255 ) +","
									+ Math.floor(opaque.g * 255) +","+Math.floor(opaque.b * 255)+ ")";
								table += "<tr><td style='padding:5px;width:70px;'><div style='width:60px;height:30px;background:"
										+ col + ";border:1px solid "
										+ range[i%20] + ";'></div></td><td>"
										+ domain[i] +"</td></tr>";
							}
						}
						table = table += "</table>";
						coloursKeyDiv.innerHTML = table;
					}
					else {
						coloursKeyDiv.innerHTML = '<img id="defaultLinkKey" src="./images/fig3_1.svg"><br><img id="logo" src="./images/logos/rappsilber-lab-small.png">';
					}
				});

				//all this init stuff needs looked at and tidied up
				xlv.filter = function (match) {
					var vChar = match.validated;
					if (vChar == 'A' && document.getElementById('A').checked && (!match.score || match.score >= xlv.cutOff)) return true;
					else if (vChar == 'B' && document.getElementById('B').checked  && (!match.score || match.score >= xlv.cutOff)) return true;
					else if (vChar == 'C' && document.getElementById('C').checked && (!match.score || match.score >= xlv.cutOff)) return true;
					else if (vChar == '?' && document.getElementById('Q').checked && (!match.score || match.score >= xlv.cutOff)) return true;
					else if (match.autovalidated && document.getElementById('AUTO').checked && (!match.score || match.score >= xlv.cutOff))  return true;
					else return false;
				};	
				xlv.checkLinks();
				xlv.initLayout();
				xlv.initProteins();				
				changeAnnotations();
				xlv.selfLinksShown = document.getElementById('selfLinks').checked;
				xlv.ambigShown = document.getElementById('ambig').checked;
				initSlider();
				
				window.onresize();*/
				
			});
			
		//]]>			
		</script>
    
        <script type="text/javascript" src="./js/SelectionPanel.js"></script>
		<script type="text/javascript" src="./js/networkFrame.js"></script>
		<script type="text/javascript" src="./js/downloads.js"></script>
		<script type="text/javascript" src="./js/crosslinkNGL.js"></script>
</html>
