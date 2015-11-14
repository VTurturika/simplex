function Simplex() { //todo у конструктор передавать функцію мети

    var A = [], /* array of conditions coefficients */
        f = [], /* array of target function coefficients */
        M = 1000000;
    /* "very big number" for method of artificial basis */
    //todo varchar, fchar

    /**
     *
     * @param input
     */

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

            switch (currentSign[1]) {
                case "<=":
                    return -1;
                case "=" :
                    return 0;
                case ">=":
                    return 1;
            }
        }

        else {
            throw new Error("error");
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

    this.getA = function () {
        return A;
    }; //todo must be changed later
}