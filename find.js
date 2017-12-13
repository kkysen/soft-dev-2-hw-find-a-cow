(function findACow(closeEnoughDistance) {
    "use strict";

    Object.prototype.print = function() {
        console.log(this);
    };

    Function.prototype.setName = function(newName) {
        Object.defineProperty(this, "name", {value: newName});
    };

    const randRange = function(min, max) {
        return Math.random() * (max - min) + min;
    };

    Array.prototype.random = function() {
        return this[Math.floor(randRange(0, this.length))];
    };

    const rgb = window.rgb = function(r, g, b) {
        return "rgb(" + r + "," + g + "," + b + ")";
    };

    const rgba = window.rgba = function(r, g, b, a) {
        return "rgba(" + r + ", " + g + ", " + g + ", " + a + ")";
    };

    const gray = function(val) {
        val = Math.floor(val);
        return rgb(val, val, val);
    };

    const makeRgbColor = (function() {
        const colorMapping = {
            red: 0,
            green: 1,
            blue: 2,
        };
        return function(color) {
            const rgbArgs = Array(3);
            const rawColorFunction = (function() {
                if (color in colorMapping) {
                    const index = colorMapping[color];
                    return function(val) {
                        rgbArgs.fill(0);
                        rgbArgs[index] = Math.floor(val);
                        return rgb.apply(null, rgbArgs);
                    };
                } else if (color === "gray") {
                    return function(val) {
                        rgbArgs.fill(Math.floor(val));
                        return rgb.apply(null, rgbArgs);
                    }
                } else {
                    return null;
                }
            })();
            const gradient = function(val) {
                return 1 - Math.pow(val, 0.3);
            };
            const colorFunction = function(val) {
                val.print();
                return rawColorFunction(Math.floor(256 * gradient(val)));
            };
            colorFunction.setName(color);
            return colorFunction;
        };
    })();

    const makeRgbaColor = (function() {
        const colorMapping = {
            gray: [255, 255, 255],
            red: [255, 0, 0],
            green: [0, 255, 0],
            blue: [0, 0, 255],
        };
        return function(color) {
            return rgba.bind(null, ...colorMapping[color]);
        }
    })();

    const makeColors = (function() {
        const colorArray = ["gray", "red", "green", "blue"];
        return function(colorMaker) {
            return colorArray
                .reduce((obj, color) => {
                        obj[color] = colorMaker(color);
                        return obj;
                    },
                    {
                        random: function() {
                            return this[colorArray.random()];
                        }
                    }
                );
        }
    })();

    const rgbColors = window.rgbColors = makeColors(makeRgbColor);

    const rgbaColors = window.rgbaColors = makeColors(makeRgbaColor);

    const distanceSquared = function(x0, y0, x1, y1) {
        const dx = x0 - x1;
        const dy = y0 - y1;
        return dx * dx + dy * dy;
    };

    const Point = (function() {
        const Point = class {

            constructor(x, y) {
                this.x = x;
                this.y = y;
            }

            static get origin() {
                return _origin;
            }

            distanceSquaredToCoordinates(x, y) {
                return distanceSquared(this.x, this.y, x, y);
            }

            distanceSquaredTo(point) {
                return this.distanceSquaredToCoordinates(point.x, point.y);
            }

            distanceTo(point) {
                return Math.sqrt(this.distanceSquaredTo(point));
            }

            toString() {
                return "(" + this.x + ", " + this.y + ")";
            }

        };
        const _origin = new Point(0, 0);
        return Point;
    }());

    const Rectangle = class {

        constructor(upperLeft, lowerRight) {
            this.offset = upperLeft;
            this.size = lowerRight;
            this.corners = [
                upperLeft,
                new Point(upperLeft.x, lowerRight.y),
                new Point(upperLeft.y, lowerRight.x),
                lowerRight
            ];
        }

        static ofSize(width, height) {
            return new Rectangle(Point.origin, new Point(width, height));
        }

        maxDistanceSquaredTo(point) {
            return Math.max.apply(null, this.corners.map(point.distanceSquaredTo.bind(point)));
        }

        randomInnerPoint() {
            this.print();
            return new Point(
                randRange(this.offset.x, this.size.x),
                randRange(this.offset.y, this.size.y)
            );
        }

        toString() {
            return "[" + this.offset + ", " + this.size + "]";
        }

    };

    const boxDiv = document.getElementById("box");
    const box = Rectangle.ofSize(boxDiv.offsetWidth, boxDiv.offsetHeight);

    const findACowOnce = function(boxDiv, box, target, closeEnoughDistance, color, newGame) {
        const maxDistanceSquared = box.maxDistanceSquaredTo(target);
        const rgbScale = 1 / maxDistanceSquared;
        const closeEnoughDistanceSquared = closeEnoughDistance * closeEnoughDistance;

        const distanceSquaredFromTarget = function(x, y) {
            return target.distanceSquaredToCoordinates(x, y);
        };

        const findIt = function(mouseEvent) {
            const d2 = distanceSquaredFromTarget(mouseEvent.offsetX, mouseEvent.offsetY) - closeEnoughDistance;
            // box.print();
            // target.print();
            Math.sqrt(d2).print();
            if (d2 < 0) {
                alert("You Won!");
                this.removeEventListener("mousemove", findIt);
                newGame();
                return;
            }
            // + 1 for small border so NaN/Infinity is not created
            this.style.backgroundColor = color(rgbScale * (d2 + 1));
        };

        boxDiv.addEventListener("mousemove", findIt);
    };

    (function startGame() {
        findACowOnce(boxDiv, box, box.randomInnerPoint(), closeEnoughDistance, rgbColors.random(), startGame);
    })();

})(10);
