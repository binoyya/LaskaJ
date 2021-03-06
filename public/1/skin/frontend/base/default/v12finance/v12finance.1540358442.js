/* 
 * V12 finance custom js
 * 
 */

var V12FinanceClass = Class.create();

V12FinanceClass.prototype = {


	initialize: function(total, productJson, priceFormat, context){
		
		this.total = total;
		this.productJson = productJson;
		this.priceFormat = priceFormat;
		this.selectedProduct;
		this.context = context ? context : 'checkout';

		this.depositElem = $('v12_deposit');
		this.productElem = $('v12_finance_option');

		$(this.depositElem).observe('change', this.update.bindAsEventListener(this));
		$(this.productElem).observe('change', this.update.bindAsEventListener(this));
		
		if(this.depositElem.value && this.productElem.value) this.update();
	},

	validate: function(){


	},

	parseDescription: function(string, data){
		
		var syntax = /(^|.|\r|\n)(\$(\w+)\$)/;
		var t = new Template(string, syntax);
		
		// Interpolate template vars. 
		// Trim currency symbol from formatted string. This is added in the template
		var map = {
				LOAN : this.formatPrice(data.loan).substring(1),
				INTEREST_RATE : data.interestRate,
				INSTALMENT : this.formatPrice(data.monthlyPayment).substring(1),
				TERM : data.term,
				TOTAL_PAYABLE : this.formatPrice(data.totalPayable).substring(1),
				CHARGE_FOR_CREDIT : this.formatPrice(data.totalInterest).substring(1),
				APR : data.apr
		};
		
		return t.evaluate(map);
	},
	
	calculate: function(product){
		
		var total = this.total;
		
		var depositPercent = this.depositElem.value;
		var depositAmount = (total / 100) * depositPercent;
		
		// Round to 1dp
		//depositAmount = parseFloat(((depositAmount*10)/10).toFixed(2));
		// Round up 0dp
		depositAmount = parseFloat(Math.round(depositAmount).toFixed(2));

		var loanAmount = total-depositAmount,
			monthlyPayment,
			totalPayable,
			interestRate,
			finalInstallment,
			totalInterest;
		
		if(product.apr == 0){
			// Regular monthly payment (e.g. months 1-5)
			monthlyPayment = parseFloat((loanAmount / product.months).toFixed(2));
			// Final installment, e.g. month 6 (installments total must never be more than total loan amount)
			// Provided templates do not support this figure.
			finalInstallment = loanAmount - (installment * (product.months - 1));
			totalInterest = 0;
			totalPayable = loanAmount;
		} else {
			monthlyPayment = parseFloat((loanAmount * product.calc_factor).toFixed(2));
			totalInterest = (monthlyPayment * product.months) - loanAmount;
			finalInstallment = 0;
		}

		totalPayable = total + totalInterest;
		interestRate = product.monthly_rate * 12;
		
		return {
			apr: product.apr,
			term: product.months.toString(),
			interestRate: interestRate.toFixed(2),
			loan: loanAmount.toFixed(2),
			depositAmount: depositAmount,
			monthlyPayment: monthlyPayment.toFixed(2),
			totalPayable: totalPayable.toFixed(2),
			totalInterest: totalInterest.toFixed(2),
			finalInstallment: finalInstallment.toFixed(2)
		}
	},
	formatPrice: function(price){
		// Uses Magento's currency formatting
		return formatCurrency(price, this.priceFormat);
	},
	update: function(){
		
		if(!this.productElem.value || !this.depositElem.value) return false;
		
		for(var i=0; i<this.productJson.length;i++){
			if(this.productJson[i].id == this.productElem.value){
				this.selectedProduct = this.productJson[i];
				break;
			}
		}
		
		var results = this.calculate(this.selectedProduct);
		
		if(this.context == 'checkout'){
			var description = this.parseDescription(this.selectedProduct.description, results);
					
			$('v12_prod_desc').innerHTML = description;
			$('v12_desc_apr').innerHTML = results.apr.toString() + '%';
			$('v12_desc_months').innerHTML = this.selectedProduct.months.toString() + ' ' + Translator.translate('months');
			$('v12_desc_installments').innerHTML = this.formatPrice(results.monthlyPayment) + '/' + Translator.translate('month');
			$('v12_desc_interest').innerHTML = this.formatPrice(results.totalInterest);
			$('v12_desc_deposit').innerHTML = this.formatPrice(results.depositAmount);
		} else {
			$('v12_prod_name').innerHTML = this.selectedProduct.name;
			$('v12_desc_installments').innerHTML = this.formatPrice(results.monthlyPayment);
			$('v12_desc_months').innerHTML = this.selectedProduct.months.toString();
			$('v12_desc_loan').innerHTML = this.formatPrice(results.loan);
			$('v12_desc_interest').innerHTML = this.formatPrice(results.totalInterest);
			$('v12_desc_deposit').innerHTML = this.formatPrice(results.depositAmount);
			$('v12_desc_totalpayable').innerHTML = this.formatPrice(results.totalPayable);
		}
	}
};


/* 
 * V12 finance custom js
 * 
 */
   
Validation.addAllThese([  ['validate-deposit-range', 'The deposit value is not within the specified range.', function(v, elm) {
               var result = Validation.get('IsEmpty').test(v) ||  /^\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/.test(v);
               var reRange = new RegExp(/^digits-range-\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)-\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/);
               $w(elm.className).each(function(name, index) {
                   if (name.match(reRange) && result) {
                       var min = parseFloat(parseFloat(name.split('-')[2], 10).toFixed(2));
                       var max = parseFloat(parseFloat(name.split('-')[3], 10).toFixed(2));
                       var val = parseFloat(parseFloat(v, 10).toFixed(2));
                       result = (v >= min) && (v <= max);
                   }
               });
               return result;
           }] ]);
    
function recalc() {
     var numb=Number($('v12finance_deposit').value);
     if (!isNaN(numb)) {
            if (numb >= mindep && numb <= maxdep) {
                sel=$("v12_finance_option").value;
                if (apr[sel]==0){
                    deposit=$('v12finance_deposit').value;

                    difference=$('js_grand_total').innerHTML-deposit;
                    loan=Math.round(difference*100)/100;
                    monthlypayment=difference/month[sel];
                    monthlypayment=Math.round(monthlypayment*100)/100;
                    monthlypayment=formatCurrency(monthlypayment, priceFormat);
                    
                    totalpayable=difference;
                    totalpayable=formatCurrency(totalpayable, priceFormat);
                    loanamount=formatCurrency(loan, priceFormat);
                    interest=0;
                    interest=formatCurrency(interest, priceFormat);
                    interestname="v12_interest"+sel;
                    monthname="v12_month"+sel;
                    installname="INSTALMENT"+sel;
                    chargename="CHARGE_FOR_CREDIT"+sel;
                    loanname="LOAN"+sel;
                    depositname="v12_deposit"+sel;
                    totalname="TOTAL_PAYABLE"+sel;
                    depositamount=formatCurrency(deposit, priceFormat);
                    $(depositname).innerHTML=depositamount;
                    $(interestname).innerHTML=interest;
                    $(monthname).innerHTML=monthlypayment;
                    if ($(installname)){ $(installname).innerHTML=monthlypayment;}
                    if ($(chargename)){ $(chargename).innerHTML=interest;}
                    if ($(loanname)){ $(loanname).innerHTML=loanamount;}
                    if ($(totalname)){ $(totalname).innerHTML=totalpayable;}
                    $("v12_deposit_min").innerHTML=formatCurrency(mindep, priceFormat);
                    $("v12_deposit_max").innerHTML=formatCurrency(maxdep, priceFormat);
                    
                } else {
                    deposit=$('v12finance_deposit').value;

                    difference=$('js_grand_total').innerHTML-deposit;
                    loan=Math.round(difference*100)/100;
                    monthlypayment=difference*cfc[sel];
                    monthlypayment=Math.round(monthlypayment*100)/100;
                    loanamount=formatCurrency(loan, priceFormat);
                    interest=monthlypayment*month[sel];
                    totalpayable=interest;
                    interest=interest-difference;
                    interest=formatCurrency(interest, priceFormat);
                    monthlypayment=formatCurrency(monthlypayment, priceFormat);

                    totalpayable=formatCurrency(totalpayable, priceFormat);
                    interestname="v12_interest"+sel;
                    monthname="v12_month"+sel;
                    installname="INSTALMENT"+sel;
                    chargename="CHARGE_FOR_CREDIT"+sel;
                    loanname="LOAN"+sel;
                    depositname="v12_deposit"+sel;
                    totalname="TOTAL_PAYABLE"+sel;
                    depositamount=formatCurrency(deposit, priceFormat);
                    $(depositname).innerHTML=depositamount;
                    $(interestname).innerHTML=interest;
                    $(monthname).innerHTML=monthlypayment;
                    if ($(installname)){ $(installname).innerHTML=monthlypayment;}
                    if ($(chargename)){ $(chargename).innerHTML=interest;}
                    if ($(loanname)){ $(loanname).innerHTML=loanamount;}
                    if ($(totalname)){ $(totalname).innerHTML=totalpayable;}
                    $("v12_deposit_min").innerHTML=formatCurrency(mindep, priceFormat);
                    $("v12_deposit_max").innerHTML=formatCurrency(maxdep, priceFormat);
                };
            };
        };
    
}
