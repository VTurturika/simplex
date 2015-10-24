function Simplex(){ //todo у конструктор передавать функцію мети

    var a = [],          /* array of conditions coefficients */
        f = [],          /* array of target function coefficients */
        M = 1000000;     /* "very big number" for method of artificial basis */

    /* set methods */
    this.setCondition = function (sign, b, q) {

       if( typeof sign == "string" &&  sign.length >= 1) { /* check if "sign" is a string and "sign" is a valid string*/

           /* check version of method
           * if the following condition equal true, than use version with string parsing
           * else use version with coefficients
           * */
           if( sign.length > 2 ) {
                //todo дописать метод із розбором рядка
           }

           else {

               a.push([]);
               var n = a.length - 1;

               var currentSign = /^((>|<)?=)$/.exec(sign); /* check sign */
               if( currentSign ) {

                   switch( currentSign[1] ) {
                       case "<=": a[n].sign = -1; break;
                       case "=" : a[n].sign =  0; break;
                       case ">=": a[n].sign =  1; break;
                   }
               }

               else {
                   throw new Error("Wrong first parameter in setCondition method");
               }

               if( isNaN( a[n].b = parseFloat(b) ) ) {
                   a.pop();
                   throw new TypeError("Wrong second parameter in setCondition method");
               }

               /* check version of method
               *  if the following condition equal true, then use version with array of coefficients
               *  else use version with coefficients as parameters
               * */
               var i;
               if( Array.isArray( q ) ) {

                   for(i = 0; i< q.length; i++) {

                       if (isNaN(a[n][i] = parseFloat(q[i])) ) {
                           a.pop();
                           throw new TypeError("Wrong element of array with " + i + " number");
                       }
                   }
               }
               else {

                   for(i = 2; i< arguments.length; i++) {

                       if (isNaN(a[n][i-2] = parseFloat(arguments[i])) ) {
                           a.pop();
                           throw new TypeError("Wrong " + (i+1) + "th parameter in setCondition method");
                       }
                   }
               }
           }
       }
       else {
           throw new TypeError("Wrong first parameter in setCondition method");
       }
    };

    this.setF = function(mode, coefficients){

        var currentMode, i;
        /* check if "mode" is a string and "mode"equal only min or only max */
        if( typeof mode == "string" && (currentMode = /(min)|(max)/.exec(mode.toLowerCase())) ) {

            f.mode = currentMode[0];
            /*
             * check version of method
             * if following condition equal true, than use version with array of coefficients
             * else use version with coefficients as parameters
             * */
            if( Array.isArray( coefficients ) ) {

                for(i = 0; i< coefficients.length; i++) {

                    if (isNaN(f[i] = parseFloat(coefficients[i])) ) {
                        f.length = 0;
                        delete f.mode;
                        throw new TypeError("Wrong element of array with " + i + " number");
                    }
                }
            }
            else {

                for(i = 1; i< arguments.length; i++) {

                    if (isNaN(f[i-1] = parseFloat(arguments[i])) ) {
                        f.length = 0;
                        delete f.mode;
                        throw new TypeError("Wrong " + (i+1) + "th parameter in setF method");
                    }
                }
            }

        }
        else {
            throw new TypeError("Wrong first parameter in ");
        }
    };

    this.getA = function() {return a; }; //todo must be changed later
}