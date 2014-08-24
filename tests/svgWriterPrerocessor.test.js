/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, bitwise: true */
/*global define: true, require: true, describe: true, beforeEach: true, afterEach: true, it: true */

var expect = require('chai').expect,
    svgWriterPreprocessor = require("../svgWriterPreprocessor.js"),
    sinon = require('sinon');

describe('SVGWriterPreprocessor', function (){
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });
    
    it("can grow bounds uniformly", function () {
        var shapeBounds = {
                left: 20,
                right: 50,
                top: 10,
                bottom: 100
            };
        
        svgWriterPreprocessor.growBoundsUniform(shapeBounds, 3);
        
        expect(shapeBounds.left).to.equal(17);
        expect(shapeBounds.right).to.equal(53);
        expect(shapeBounds.top).to.equal(7);
        expect(shapeBounds.bottom).to.equal(103);
    });
    
    it("knows how to trim to artwork", function () {
        
        var svgOM = {
                viewBox: {
                    left: 0,
                    right: 50,
                    top: 0,
                    bottom: 100
                },
                children:[
                    {
                        type: "shape",
                        shapeBounds: {
                            left: 20,
                            right: 50,
                            top: 10,
                            bottom: 100
                        },
                        style: {
                            stroke: {
                                strokeEnabled: true,
                                lineWidth: 3
                            }
                        }
                    },
                    {
                        type: "text",
                        shapeBounds: {
                            left: 20,
                            right: 50,
                            top: 10,
                            bottom: 100
                        },
                        position: {
                            x: 22.0,
                            y: 33.0
                        },
                        children: [
                            {
                                type: "tspan",
                                text: "spanny t",
                                position: {
                                    x: 10.0,
                                    y: 20.9
                                }
                            }
                        ]
                    }
                ]
            },
            ctx = {
                svgOM: svgOM,
                currentOMNode: svgOM,
                contentBounds: {},
                config: {
                    trimToArtBounds: true
                }
            };
        
        svgWriterPreprocessor.processSVGOM(ctx);
        
        expect(svgOM.viewBox.top).to.equal(8.5);
        expect(svgOM.viewBox.left).to.equal(18.5);
        expect(svgOM.viewBox.right).to.equal(51.5);
        expect(svgOM.viewBox.bottom).to.equal(101.5);
        
        expect(svgOM.children[0].shapeBounds.top).to.equal(10);
        expect(svgOM.children[0].shapeBounds.left).to.equal(20);
        expect(svgOM.children[0].shapeBounds.right).to.equal(50);
        expect(svgOM.children[0].shapeBounds.bottom).to.equal(100);
    });
    
});
