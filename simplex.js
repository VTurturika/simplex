function Simplex() {

    var A = [],      // array of conditions coefficients
        f = [],      // array of target function coefficients
        M = 1000000, // "very big number" for method of artificial basis
        realNumVariables,
        isResult,
        isFractinMode;
    //todo varchar, fchar

    var steps = [];

    /**
     * Set Simplex class params
     * @param {Object} input - object with parameters
     * @param.option {Array}  input.f - coefficients of target function
     * @param.option {String} input.mode - mode of problem (max/min)
     * @param.option {String} input.func - target function as string
     *                !!! use only func or only f + mode params
     * @param.option {Boolean} input.fraction - if equal true then calc answer as fraction
     *
     * @param.option {Object} input.c - setting SINGLE condition
     *  @param.option {String} input.c.sign - current condition sign (<= | = | >=)
     *  @param.option {Array}  input.c.a - coefficients next to x in current row of matrix
     *  @param.option {Number} input.c.b - current condition "free member";
     *  @param.option {String} input.c.str - set condition as string
     *                  !!! use only c.str or only c.a + c.b + c.sign params
     *
     * @param.option {Object} input.conditions - setting MULTIPLE conditions
     *  @param.option {Object} input.conditions.cI - specify concrete condition (I = 0,1,2 ..condition_count-1)
     *      @param.option {String} input.conditions.cI.sign - watch input.c.sign
     *      @param.option {Array} input.conditions.cI.a - watch input.c.a
     *      @param.option {Number} input.conditions.cI.b - watch input.c.b
     *      @param.option {String} input.conditions.cI.str - watch input.c.str
     */
    this.set = function (input) {

        var i;

        if(isFractinMode == undefined )isFractinMode = input.fraction || false;

        if (input.f && input.mode) { //target function

            f.length = 0;
            var mode = /(min)|(max)/.exec(input.mode.toLowerCase());

            if(!mode) throw new Error("Wrong mode of target function");

            for (i = 0; i < input.f.length; i++) {

                f[i] = numberParser(input.f[i]);
                if(f[i] === false) {
                    f.length=0;
                    throw new TypeError("Invalid input number!");
                }
            }

            f.mode = mode[0];
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
        isResult = false;
    };

    function checkSign(s) {

        var currentSign = /^((>|<)?=)$/.exec(s);
        if (currentSign) {
            return currentSign[0];
        }

        else {
            throw new Error("Invalid sign");
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
        A[row].b = numberParser(b);

        if( A[row].b === false ) {
            delete A[row].sign;
            delete A[row].b;
            throw new TypeError("Invalid input number!");
        }

        for (var i = 0; i < a.length; i++) {

            A[row][i] = numberParser(a[i]);
            if( A[row][i] === false ) {
                delete A[row];
                throw new TypeError("Invalid input number!");
            }
        }
    }

    function normalize() {

        // getting max number of variables from each condition
        var n = A.reduce(function(max,current){
            return max.length > current.length ? max.length : current.length;
        });

        realNumVariables = n;

        var m = A.length,
            extendVars = new Array(m),
            extendCount = 0, i;

        for(i=0; i<m; i++) {

           if(A[i].b < 0) {  //normalizing "free" member;
               A[i].forEach(function(item, j, arr){arr[j] *= -1;});
               A[i].b *= -1;
               A[i].sign = reverseSign(A[i].sign);
           }
           //changing inequalities to equalities
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
        // filling additional variables into target function
        var temp = {}; temp.mode = f.mode;
        f = f.concat(Array.apply(null, Array(n + extendCount - f.length)).map(Number.prototype.valueOf,0));
        f.mode = temp.mode;

        // filling additional zeros to each condition (equality of lengths of each condition)
        // filling additional variables into each condition
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

    function firstBasis() {

        var m = A.length, n = f.length,
            basis = new Array( A.length),
            pos, i, hasBasisVar=false;
        for(i = 0; i<m; i++) {

            pos=0;
            // finding basis variable
            while( (pos=A[i].indexOf(1,pos)) != -1 ) {

                hasBasisVar = false;
                //checking variable to basis
                hasBasisVar = A.every(function(item, row, arr){

                    if( row == i ) return true;
                    else if(arr[row][pos] == 0 ) return true;
                    else return false;
                });

                if( hasBasisVar ) break;
                pos++;
            }

            if( hasBasisVar ) {
                basis[i]=pos;
            }
            else { //adding fake variable to basis
                n++;
                f.push( (f.mode == "max") ? -M : M );
                A.forEach(function(item,row,arr){
                    arr[row][n-1] = (row == i ) ? 1 : 0;
                });
                basis[i]=n-1;
            }
        }

        return basis;
    }

    function calc() {

        normalize();
        var basis = firstBasis(),
            n = f.length,
            m = A.length,
            delta = [],
            theta = [],
            i, j, si, sj,
            solver, result = 0;

        while ( true ) {

            delta = f.slice(0);
            delta.forEach(function(item, i, arr){
                arr[i] *= -1;
            });

            for(i=0; i<m; i++) {
                for(j=-1;j<n; j++) {

                    if( j < 0)
                        result += A[i].b * f[ basis[i] ];
                    else
                        delta[j] += A[i][j] *f[ basis[i] ];
                }
            }

            solver = (f.mode == "max") ? Math.min.apply(null, delta)
                                       : Math.max.apply(null, delta);

            if     (f.mode == "max" && solver >= 0 ) break;
            else if(f.mode == "min" && solver <= 0 ) break;

            sj = delta.indexOf(solver);

            for(i=0; i<m; i++) {

                if(A[i][sj] > 0) {
                    theta[i] = A[i].b / A[i][sj];
                }
                else {
                    theta[i]=M;
                }
            }
            si = theta.indexOf(Math.min.apply(null, theta));

            solver = A[si][sj];

            steps.push( addStep(basis, result, delta, theta, solver, si, sj) );

            var prev = copyA();

            for(i = 0; i<m; i++) {
                for(j=-1; j<n; j++) {

                    if( j < 0 )
                        A[i].b = nextPlan("b", prev, solver, i, j, si, sj);
                    else
                        A[i][j] = nextPlan("a", prev, solver, i, j, si, sj);
                }
            }

            basis[si] = sj;
            result = 0;
            theta.length = 0;
        }

        steps.push( addStep(basis, result, delta, theta, solver) );

        isResult = true;
    }

    function calcAsFraction() {
        normalize();
        var basis = firstBasis(),
            n = f.length,
            m = A.length,
            delta = [],
            theta = [],
            i, j, si, sj,
            solver, result = 0;

        while(true) {
            delta = f.slice(0);
            delta.forEach(function(item, i, arr){
                arr[i] *= -1;
            });

            for(i=0; i<m; i++) {
                for(j=-1;j<n; j++) {

                    if( j < 0)
                        result = Fraction(result).add(Fraction(A[i].b).mul(Fraction(f[ basis[i] ])));
                    else
                        delta[j] = Fraction(delta[j]).add(Fraction(A[i][j]).mul(f[ basis[i] ]));
                }
            }

            solver = (f.mode == "max") ? Math.min.apply(null, delta)
                                       : Math.max.apply(null, delta);


            if     (f.mode == "max" && solver >= 0 ) break;
            else if(f.mode == "min" && solver <= 0 ) break;

            sj=indexOfFraction(delta,solver);

            for(i=0; i<m; i++) {

                if(A[i][sj] > 0) {
                    theta[i] = A[i].b / A[i][sj];
                }
                else {
                    theta[i]=M;
                }
            }
            si = indexOfFraction(theta,Fraction(Math.min.apply(null, theta)));

            solver = new Fraction(A[si][sj]);

            steps.push( addStep(basis, result, delta, theta, solver, si, sj) );

            var prev = copyA();

            for(i = 0; i<m; i++) {
                for(j=-1; j<n; j++) {

                    if( j < 0 )
                        A[i].b = nextPlanAsFraction("b", prev, solver, i, j, si, sj);
                    else
                        A[i][j] = nextPlanAsFraction("a", prev, solver, i, j, si, sj);
                }
            }

            basis[si] = sj;
            result = 0;
            theta.length = 0;
        }

        steps.push( addStep(basis, result, delta, theta, solver) );

        isResult = true;
    }

    function addStep( basis, result, delta, theta, solver, si, sj ) {

        var newStep = {};

        newStep.a = copyA();
        newStep.basis = basis.slice(0);
        newStep.result = result;
        newStep.theta =  [];
        for(var i=0;i < theta.length; i++){
            if(theta[i] != M) newStep.theta.push(theta[i]);
            else newStep.theta.push(undefined);
        }
        newStep.solver = solver;
        newStep.si=si;
        newStep.sj=sj;
        var pos;
        newStep.X = new Array(realNumVariables);
        for(i = 0; i< realNumVariables; i++) {

            if( (pos=basis.indexOf(i)) != -1)
                newStep.X[i]=newStep.a[pos].b;
            else
                newStep.X[i] = 0;
        }

        if( !delta.every(function(item,i,arr){

           if( arr[i] >= M) return false;
           else return true;
        }))

        delta.forEach(function(item,i,arr){

            arr[i] = (arr[i] / M).toFixed(2);

        });

        newStep.delta = delta.slice(0);

        return newStep;
    }

    function indexOfFraction(arr, item) {
        for(var i = 0; i<arr.length; i++) {
            if(Fraction(item).compare(Fraction(arr[i])) == 0) {
                return i
            }
        }
        return -1;
    }

    function copyA() {
        var result = [];
        for(var i = 0; i< A.length; i++) {
            result[i] = A[i].slice(0);
            result[i].b = A[i].b;
            result[i].sign = A[i].sign;
        }
        return result;
    }

    function nextPlan(mode, a, solver, i, j, si, sj) {

        if( mode == "a" ) {

            if(i == si)
                return a[i][j] / solver;
            else if( i != si && j == sj )
                return 0;
            else
                return (solver*a[i][j] - a[si][j]*a[i][sj]) / solver;
        }
        else if (mode  == "b") {

            if( i == si )
                return a[i].b / solver;
            else
                return (solver*a[i].b - a[si].b*a[i][sj]) / solver;
        }
    }

    function nextPlanAsFraction(mode, a, solver, i, j, si, sj){

        if( mode == "a" ) {

            if(i == si)
                return Fraction(a[i][j]).div(Fraction(solver));
            else if( i != si && j == sj )
                return Fraction(0);
            else
                return Fraction(solver).mul(Fraction(a[i][j])).sub(Fraction(a[si][j]).mul(Fraction(a[i][sj]))).div(Fraction(solver));
        }
        else if (mode  == "b") {

            if( i == si )
                return Fraction(a[i].b).div(Fraction(solver));
            else
                return Fraction(solver).mul(Fraction(a[i].b)).sub(Fraction(a[si].b).mul(Fraction(a[i][sj]))).div(Fraction(solver));
        }
    }

    function numberParser(x) {

        if( !isNaN(x=parseFloat(x)) ) return x;
        else return false;
    }

    this.get = function (param) {

        if(!isResult && isFractinMode) calcAsFraction();
        else if(!isResult && !isFractinMode) calc();

        var answer = {};

        answer.numVars = f.length;
        answer.numConds = A.length;
        answer.numSteps = steps.length;
        answer.realNumVariables = realNumVariables;
        answer.result = steps[answer.numSteps - 1].result;
        answer.resultX = steps[answer.numSteps - 1].X;
        answer.f = f;

        if( param == "steps" ) {
            answer.steps = steps;
        }

        if ( numberParser(param) !== false && 0 <= param && param <answer.numSteps  ) {
            answer.step = steps[param];
        }

        return answer;
    };

    this.reset = function() {
        A.length=0;
        f.length=0;
        delete f.mode;
        realNumVariables=0;
        isResult=false;
        steps.length=0;
    }

}