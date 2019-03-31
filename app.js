var budgetController = ( function() {
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calculatePercentage = function(income){
        
        if(income > 0)
        {
            this.percentage = Math.round(this.value/income * 100);
        }
        else
            this.percentage = -1;
    };
    
    Expense.prototype.getPercentage = function(){
        
        return this.percentage;
        
    };
    
    var calculateTotals = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        
        totals: {
            exp: 0,
            inc: 0
        },
        
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val){
            var ID, newItem;
            
            // ID of the new item will be ID of the last item + 1
            if(data.allItems[type].length === 0)
                ID = 1;
            else
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            
            // Create new object depending on the type
            if(type === 'inc')
                newItem = new Income(ID, des, val);
            else
                if(type === 'exp')
                    newItem = new Expense(ID, des, val);
            
            // Push the object to the data structure
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        deleteItem: function(type, ID){
            
            var ids, index;
            
            ids = data.allItems[type].map(function(cur) {
                return cur.id;
            });
            
            index = ids.indexOf(ID);
            
            if(index !== -1)
            {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function(){
            
            calculateTotals('inc');
            calculateTotals('exp');
            
            data.budget = data.totals.inc - data.totals.exp; 
            
            if(data.totals.inc > 0)
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            else
                data.percentage = -1;
        },
        
        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        calculatePercentages: function(){
            
            data.allItems.exp.forEach(function(cur){
                cur.calculatePercentage(data.totals.inc);
            });
            
        },
        
        getPercentages: function(){
            
            var percentages;
            
            percentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            
            return percentages;
            
        },
        
        testing: function(){
            console.log(data);
        }
    };
    
})();



var UIController = ( function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        ExpensesLabel: '.budget__expenses--value',
        percentagelabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        monthLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
        
        var sign;
        
        num = Math.abs(num);
        num = num.toFixed(2);
        
        if(num.length > 6){
            num = num.substr(0, num.length-6) + ',' + num.substr(num.length-6, 6);
        }
        
        if(type === 'inc')
            sign = '+ ';
        else
            sign = '- ';
        
        return sign + num;
        
    };
    
    var nodeListForEach = function(arr, cb){
        for(var i=0;i<arr.length;i++)
            cb(arr[i], i);
    };
    
    return {
        getInput : function(){
            return {
              
                type: document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)  
              
            };          
        },
        
        getDOM: function(){
            return DOMstrings;
        },
        
        addItem: function(obj, type){
            
            var html, element, newHtml;
            
            if(type === 'inc')
            {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>';
            }
            else if(type === 'exp')
                {
                    element = DOMstrings.expenseContainer;
                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>';
                }
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteItem: function(ID){
            
            var el;
            
            el = document.getElementById(ID);
            el.parentNode.removeChild(el);
            
        },
        
        clearFields: function(){
            
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current){
                current.value = "";
            });
            
            fieldsArr[0].focus();
            
        },
        
        changedType: function(){
            
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur, ind){
                
                cur.classList.toggle('red-focus');
                
            });
            
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
            
        },
        
        displayBudget: function(obj){
            
            var type;
            if(obj.budget >=0)
                type = 'inc';
            else
                type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.ExpensesLabel).textContent = formatNumber(obj.totalExpense, 'exp');
            if(obj.percentage > 0)
                document.querySelector(DOMstrings.percentagelabel).textContent = obj.percentage + '%';
            else
                document.querySelector(DOMstrings.percentagelabel).textContent = '---';
        },
        
        displayPercentages: function(list){
            
            var fields = document.querySelectorAll(DOMstrings.expPercentageLabel);
            
            var callBack = function(cur, ind){
                
                if(list[ind] > 0)
                    cur.textContent = list[ind] + '%';
                else
                    cur.textContent = '---';
            };
            
            nodeListForEach(fields, callBack);
            
        },
        
        displayMonth: function(){
            
            var now, year, month, months;
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            
            document.querySelector(DOMstrings.monthLabel).textContent = months[month] + ' ' + year;
            console.log(months[month] + ' ' + year);
            
        }
    };
    
})();



var AppController = ( function(budCtrl, uiCtrl) {
    
    var setupEventListeners = function() {
        
        var DOM = uiCtrl.getDOM();
        
        document.querySelector(DOM.inputButton).addEventListener('click', addCtrlBtn);
    
        document.addEventListener('keypress', function(event) {
       
            if(event.keyCode === 13 || event.which === 13)
            {
                addCtrlBtn();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', deleteCtrlBtn);
        
        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changedType);
    };
    
    var updatePercentages = function(){
        
        //calculate the percentages
        budCtrl.calculatePercentages();
        
        //retrieve the percentages
        var percentages = budCtrl.getPercentages();
        
        //update the ui with the percentages
        uiCtrl.displayPercentages(percentages);
    };
    
    var deleteCtrlBtn = function(event){
        
        var itemID,splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID)
        {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            budCtrl.deleteItem(type, ID);
            
            uiCtrl.deleteItem(itemID);
            
            updateBudget();
            
            updatePercentages();
        }
        
    };
    
    var updateBudget = function(){
        
        //calculate the budget
        budCtrl.calculateBudget();
        
        //return the budget and stuff
        var budget = budCtrl.getBudget();
        
        //display the budget on the UI
        uiCtrl.displayBudget(budget);
        
    };
    
    var addCtrlBtn = function() {
      
        var input, newItem;
        
        // Get input from the fields
        input = uiCtrl.getInput();
        
        //if input is invalid
        if(input.description === '' || isNaN(input.value) || input.value <=0)
            return;
        
        // Add item to the data structure
        newItem = budCtrl.addItem(input.type, input.description, input.value);
//        console.log(newItem);
        
        // Add item to the UI
        uiCtrl.addItem(newItem, input.type);
        
        //Clear the fields
        uiCtrl.clearFields();
        
        // Update the budget
        // Update budget UI 
        updateBudget();
        
        updatePercentages();
        
    };
    
    return {
        init: function(){
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

AppController.init();