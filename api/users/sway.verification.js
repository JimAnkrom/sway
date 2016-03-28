/**
 * Created by Jim Ankrom on 2/21/2016.
 *
 * Verify that the system this is being run on supports all necessary ES6 features
 */
"use strict";
function log(message) {
    console.log('Verification Error: ' + message );
}

if (!Symbol.iterator) log('Symbol.iterator not found');

var iter = 0;
var iterable = {
    [Symbol.iterator]: function () {
        return {
            next: function () {
                if (iter == 1) return { done: true };
                iter++;
                return { value: "hello world", done: false };
            }
        };
    }
};

var testResult;
for(let value of iterable){
    testResult = value;
}
if (!testResult) log('iterable not iterable');
if (!(testResult=="hello world")) log('iterable not iterating correctly');
