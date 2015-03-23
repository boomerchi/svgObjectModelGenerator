// Copyright (c) 2014, 2015 Adobe Systems Incorporated. All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, bitwise: true */
/*global define: true, require: true */

/* Help write the SVG */

(function () {
    "use strict";
    
    var svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterGradient = require("./svgWriterGradient.js");
    
    var writeGradient = svgWriterGradient.writeGradient,
        writeColor = svgWriterUtils.writeColor;
    
    function SVGWriterFill() {

        this.externalizeStyles = function (ctx) {
            var omIn = ctx.currentOMNode,
                fill,
                gradientID,
                styleBlock = ctx.omStylesheet.getStyleBlock(omIn, ctx.ID.getUnique);
            
            if (!omIn.style || !omIn.style.fill) {
                return;
            }
            fill = omIn.style.fill;

            if (fill.type === "gradient") {
                gradientID = writeGradient(ctx, ctx.svgOM.global.gradients[fill.gradient], "-fill");
                if (gradientID) {
                    styleBlock.addRule("fill", "url(#" + gradientID + ")");
                }
            } else {
                styleBlock.addRule("fill", svgWriterUtils.writeColor(fill.color));
            }

            if (isFinite(omIn.style.fill.opacity) && omIn.style.fill.opacity !== 1) {
                styleBlock.addRule("fill-opacity", omIn.style.fill.opacity);
            }
        };
	}

	module.exports = new SVGWriterFill();
    
}());
