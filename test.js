function badStyle(){
var x = 42;
eval("console.log(x)"); // should be avoided
return;
console.log("Unreachable"); // unreachable code
}
