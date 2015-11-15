function Simplex() { //todo у конструктор передавать функцію мети

    var A = [], /* array of conditions coefficients */
        f = [], /* array of target function coefficients */
        M = 1000000;
    /* "very big number" for method of artificial basis */
    //todo varchar, fchar

    this.set = function (input) {

        var i;

        if (input.f && input.mode) { //target function

            f.length = 0;
            f.mode = /(min)|(max)/.exec(input.mode.toLowerCase());

            //todo parsing input.f / input.mode
            for (i = 0; i < input.f.length; i++) {

                f[i] = input.f[i];
            }

            f.mode = input.mode;
        }
        else if (input.func) {
            //todo parsing input.func;
        }

        if (input.modify) {

            //todo support to modify data
        }

        if (input.c) {

            if (input.c.sign && input.c.a && input.c.b) {


                parseCondition((input.c.row == 0 ? 0 : ( input.c.row || A.length ) ),
                    input.c.sign, input.c.a, input.c.b);

            }
            else if (input.c.str) {
                //todo parsing input.c.srt;
            }
        }

        if (input.conditions) {

            var condCount = 0;//input.conditions.start || 0;

            while (input.conditions["c" + condCount]) {

                var condition = input.conditions["c" + condCount];

                if (condition.sign && condition.a && condition.b) {
                    parseCondition(condCount, condition.sign, condition.a, condition.b);
                }
                else if (condition.str) {

                }
                condCount++;
            }
        }
    };

    function checkSign(s) {

        var currentSign = /^((>|<)?=)$/.exec(s);
        if (currentSign) {
            return currentSign[0];
        }

        else {
            throw new Error("error");
        }

    }

    function reverseSign(s) {

        switch (s) {
            case "<=": return ">=";
            case  "=": return  "=";
            case ">=": return "<=";
        }
    }

    function parseCondition(row, s, a, b) {

        var currentSign = checkSign(s);

        if (!A[row]) {
            A.splice(row, 0, []);
        }
        else {
            A[row].length = 0;
        }

        A[row].sign = currentSign;
        A[row].b = b;

        for (var i = 0; i < a.length; i++) {

            A[row][i] = a[i];
        }
    }

    function normalize() {

        // get max number of variables from each condition
        var n = A.reduce(function(max,current){
            return max.length > current.length ? max.length : current.length;
        });

        var m = A.length,
            extendVars = new Array(m),
            extendCount = 0, i;

        for(i=0; i<m; i++) {

           if(A[i].b < 0) {
               A[i].forEach(function(item, j, arr){arr[j] *= -1;});
               A[i].b *= -1;
               A[i].sign = reverseSign(A[i].sign);
           }

           if( A[i].sign == "<=" ) {
               extendVars[i] = 1;
               A[i].sign = "=";
               extendCount++;
           }
           else if( A[i].sign == ">="  ) {
               extendVars[i] = -1;
               A[i].sign = "=";
               extendCount++;
           }
        }
        var temp = {}; temp.mode = f.mode;
        f = f.concat(Array.apply(null, Array(n + extendCount - f.length)).map(Number.prototype.valueOf,0));
        f.mode = temp.mode;

        var offsetExtendVar = 0;
        for(i=0;i<m;i++){

            temp.sign = A[i].sign; temp.b = A[i].b;
            A[i] = A[i].concat(Array.apply(null, Array(n + extendCount - A[i].length)).map(Number.prototype.valueOf,0));
            A[i].sign = temp.sign; A[i].b = temp.b;

            if( extendVars[i] ) {
                A[i][n + offsetExtendVar++] = extendVars[i];
            }
        }
    }

    this.getA = function () {
        normalize();
        return A;
    }; //todo must be changed later

    this.getF = function() {
        return f;
    }
}