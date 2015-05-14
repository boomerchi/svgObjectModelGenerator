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

/* given an svgOM, generate SVG */

(function () {
    "use strict";

    var svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterPreprocessor = require("./svgWriterPreprocessor.js"),
        Tag = require("./svgWriterTag.js"),
        SVGWriterContext = require("./svgWriterContext.js"),
        ID = require("./idGenerator.js"),
        toString = svgWriterUtils.toString;

    function getFormatContext(svgOM, cfg, errors) {
        return new SVGWriterContext(svgOM, cfg, errors);
    }

    function superfluousGroups(tag, ctx, parents, num) {
        var mum = parents[parents.length - 1];
        if (tag.name == "g" && tag.children.length < 2 &&
            !tag.isArtboard &&
            (!tag.styleBlock || tag.styleBlock && !tag.styleBlock.hasRules()) &&
            tag.getAttribute("transform") == "") {
            if (Object.keys(tag.attrs).length) {
                return;
            }
            if (tag.children.length) {
                mum.children[num] = tag.children[0];
            } else {
                mum.children.splice(num, 1);
            }
            return true;
        }
    }

    function clipRule(tag, ctx, parents) {
        var fillRule = tag.styleBlock && tag.styleBlock.getPropertyValue("fill-rule");
        if (!fillRule) {
            return;
        }
        var isClipPathParent;
        for (var i = 0, len = parents.length; i < len; i++) {
            if (parents[i].name == "clipPath") {
                isClipPathParent = true;
                break;
            }
        }
        if (!isClipPathParent) {
            return;
        }
        tag.styleBlock.addRule("clip-rule", fillRule);
        tag.styleBlock.removeRule("fill-rule");
    }

    function process(tag, ctx, parents, num) {
        superfluousGroups(tag, ctx, parents, num);
        clipRule(tag, ctx, parents, num);
    }

    function preProcess(tag, ctx, parents, num) {
        parents = parents || [];
        parents.push(tag);
        if (tag.children) {
            for (var i = 0; i < tag.children.length; i++) {
                preProcess(tag.children[i], ctx, parents.slice(0), i);
            }
        }
        parents.pop();
        process(tag, ctx, parents.slice(0), num);
    }

    function processStyle(ctx, blocks) {
        var id = new ID(ctx.idType);
        for (var i in blocks) {
            if (blocks[i].tags && blocks[i].rules.length) {
                blocks[i].class[0] = id.getUnique("cls");
            }
        }
    }

    function print(svgOM, opt, errors) {
        var ctx = getFormatContext(svgOM, opt || {}, errors);
        try {
            Tag.resetRoot();
            svgWriterPreprocessor.processSVGOM(ctx);
            var svg = Tag.make(ctx, svgOM),
                hasRules = !ctx.usePresentationAttribute && ctx.omStylesheet.hasRules(),
                hasDefines = ctx.omStylesheet.hasDefines();
            if (hasRules || hasDefines) {
                svg.children.unshift(ctx.omStylesheet.getDefsTag());
            }
            preProcess(svg, ctx);
            ctx.omStylesheet.consolidateStyleBlocks();
            processStyle(ctx, ctx.omStylesheet.blocks);
            svg.write(ctx);
        } catch (ex) {
            console.error("Ex: " + ex);
            console.log(ex.stack);
        }
        return toString(ctx);
    }

    module.exports.printSVG = print;
}());
