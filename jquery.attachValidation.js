/**
    Authors: Stephen Zsolnai http://www.aqueduct.co.uk
    ver: 1.0

    This is an extension to the jQuery validator. 

    Requires: 
    ---------
    jQuery v1.5.2 or later: 
        http://docs.jquery.com/Downloading_jQuery#Download_jQuery
    jQuery validator plugin: 
        tested with 1.8.1
        http://bassistance.de/jquery-plugins/jquery-plugin-validation/
    
    Usage:
    ------
    Please see the demo.html page for an example of the markup needed.

    Initialise the plugin on the wrapper to a form.
    $('.formwrapper').attachValidation(options);

    More details markup options can be found: http://front-end-standards.aquepreview.com/forms/index.html

    Validator docs can be found: 
    <http://docs.jquery.com/Plugins/Validation>
    <http://bassistance.de/jquery-plugins/jquery-plugin-validation/>

    
    Options Object
    --------------

    Validator Messages
    ---
    All of these are overridden here as a span tag is added to help with 
    advanced css styling if necessary.

    validatorMessages: {
        required: "<span>This is a required field</span>",
        remote: "<span>Please fix this field.</span>",
        email: "<span>Please enter a valid email address.</span>",
        url: "<span>Please enter a valid URL.</span>",
        date: "<span>Please enter a valid date.</span>",
        dateISO: "<span>Please enter a valid date (ISO).</span>",
        number: "<span>Please enter a valid number.</span>",
        digits: "<span>Please enter only digits.</span>",
        creditcard: "<span>Please enter a valid credit card number.</span>",
        equalTo: "<span>Please enter the same value again.</span>",
        accept: "<span>Please enter a value with a valid extension.</span>",
        maxlength: $.validator.format("<span>Please enter no more than {0} characters.</span>"),
        minlength: $.validator.format("<span>Please enter at least {0} characters.</span>"),
        rangelength: $.validator.format("<span>Please enter a value between {0} and {1} characters long.</span>"),
        range: $.validator.format("<span>Please enter a value between {0} and {1}.</span>"),
        max: $.validator.format("<span>Please enter a value less than or equal to {0}.</span>"),
        min: $.validator.format("<span>Please enter a value greater than or equal to {0}.</span>"),
        postcode: "<span>Please enter a valid postcode</span>",
        terms: "<span>Please make sure you understand our terms and conditions by checking the box</span>"
    }
                
*/
/*jslint browser: true, vars: true, white: true, forin: true, plusplus: true, indent: 4 */
(function($) {
    'use strict';
    
    var $body = $('html, body'),
	    DEFAULTS = {
	        errorSummary: {
                header: 'There were problems with your request.',
                errorSummaryMessagesClass: 'form-errorContainer-messages'
            },
            validatorMessages: {
                required: "<span>This is a required field</span>",
                remote: "<span>Please fix this field.</span>",
                email: "<span>Please enter a valid email address.</span>",
                url: "<span>Please enter a valid URL.</span>",
                date: "<span>Please enter a valid date.</span>",
                dateISO: "<span>Please enter a valid date (ISO).</span>",
                number: "<span>Please enter a valid number.</span>",
                digits: "<span>Please enter only digits.</span>",
                creditcard: "<span>Please enter a valid credit card number.</span>",
                equalTo: "<span>Please enter the same value again.</span>",
                accept: "<span>Please enter a value with a valid extension.</span>",
                maxlength: $.validator.format("<span>Please enter no more than {0} characters.</span>"),
                minlength: $.validator.format("<span>Please enter at least {0} characters.</span>"),
                rangelength: $.validator.format("<span>Please enter a value between {0} and {1} characters long.</span>"),
                range: $.validator.format("<span>Please enter a value between {0} and {1}.</span>"),
                max: $.validator.format("<span>Please enter a value less than or equal to {0}.</span>"),
                min: $.validator.format("<span>Please enter a value greater than or equal to {0}.</span>"),
                postcode: "<span>Please enter a valid postcode</span>",
                terms: "<span>Please make sure you understand our terms and conditions by checking the box</span>"
            } 
        }
    ;

    /* add jQuery validator postcode method */
    $.validator.addMethod("postcode", function (value, element) {
        return this.optional(element) || /(GIR 0AA|[A-PR-UWYZ]([0-9][0-9A-HJKPS-UW]?|[A-HK-Y][0-9][0-9ABEHMNPRV-Y]?)[ ]?[0-9][ABD-HJLNP-UW-Z]{2})/i.test(value);
    }, $.validator.messages.postcode);
		
    var attachValidationToForms = function ($context) {
        $context.find('form').each(function () {
            $(this).validate();
        });
    };

    /**
     * Checks error summary container for header and error list
     */
    var initialiseErrorSummary = function ($errorSummary, header) {
        var headerText = header || $errorSummary.data('header'),
            $header = $errorSummary.find('h2'),
            $list = $errorSummary.find('ul');
        if ($errorSummary.html() === '') {
            $errorSummary.html('<h2>' + headerText + '</h2><ul></ul>');
        } else {
            $header.text(headerText);
        }
    };

    /** this function gets the text label appropriate for an elementId */
    var getLabelText = function (elementId) {
        var $elementLabel = $('.label-text[for="' + elementId + '"]'),
            $fieldGroup = $elementLabel.closest('.field-group'),
            labelText;


        // if the field is part of a field-group then we want to grab the group header
        if ($fieldGroup.length > 0) {
            labelText = $fieldGroup.find('.field-group-header').text();
        } else {
            labelText = $elementLabel.text();
        }

        return labelText.replace(/\*$/, '').replace(/:?[ ]*$/, '') + ': ';
    };

    /** returns a jQuery object for a new <li> ready to be added to an error summary */
    var getErrorListItem = function (elementId, errorMessage) {
        return $('<li><label for="' + elementId + '">' + errorMessage + '</label></li>');
    };

    var syncFieldGroupValidation = function ($fieldGroup) {
        window.log('sync field-group validation');
        if ($fieldGroup.length > 0) {
            $fieldGroup
                .find('.label-error-msg')
                .each(function () {
                    var $this = $(this).removeClass('label-error-msgThidden'),
                        $element = $this.data('linked-element');

                    if ($element.length > 0) {
                        if ($element[0].$errorSummaryListItem) {
                            $element[0].$errorSummaryListItem.show();
                        }
                    }
                })
                .filter(':visible')
                .filter(':gt(0)')
                .each(function () {
                    var $this = $(this),
                        $element = $this.data('linked-element');

                    if ($element.length > 0) {
                        if ($element[0].$errorSummaryListItem) {
                            $element[0].$errorSummaryListItem.hide();
                        }
                    }
                    $this.addClass('label-error-msgThidden');
                });
        }
    };


    $.fn.attachValidation = function(options) {
       
        var settings = $.extend(true, {},  DEFAULTS, options);
        $.extend($.validator.messages, settings.validatorMessages);

        // update the global validator options
		$.extend(true, $.validator.defaults, {
			messages: {},
			groups: {},
			rules: {},
			errorClass: "label-error-msg",
			validClass: "valid",
			errorElement: "label",
			focusInvalid: true,
			errorContainer: $( [] ),
			errorLabelContainer: $( [] ),
            errorPlacement: function (error, $element) {
                var $fieldGroup = $element.closest('.field-group');
                if ($fieldGroup.length > 0) {
                    $fieldGroup.append(error);
                } else {
                    error.insertAfter($element);
                }
                error.data('linked-element', $element);
            },
			highlight: function (element, errorClass, validClass) {
				var $element = $(element),
					$fieldItem = $element.closest('.field-item').addClass('field-itemTerror'),
					$fieldGroup = $element.closest('.field-group').addClass('field-groupTerror');
				// show error summary item
				if (element.$errorSummaryListItem) {
					element.$errorSummaryListItem.show();
				}
			},
			unhighlight: function (element, errorClass, validClass) {
				var $element = $(element),
					$fieldGroup = $element.closest('.field-group');

				$element.closest('.field-item').removeClass('field-itemTerror');

				if (element.$errorSummaryListItem) {
					element.$errorSummaryListItem.remove();
					delete element.$errorSummaryListItem;
				}
			},
            showErrors: function (errorMap, errorList) {
                var validator = this,
                    $errorSummary,
                    $errorList,
                    fieldGroups = [];

                if (errorList.length > 0) {
                    $errorSummary = $(errorList[0].element).closest('.form-errorContainer').find('.form-errorSummary');
                    initialiseErrorSummary($errorSummary);
                    $errorList = $errorSummary.find('ul:not(.' + settings.errorSummary.errorSummaryMessagesClass + ')');

                    // cycle through each error
                    $(errorList).each(function () {
                        var $element = $(this.element),
                            $fieldGroup = $element.closest('.field-group'),
                            labelText = getLabelText(this.element.id),
                            errorMessage = labelText + this.message,
                            $errorSummaryListItem;

                        $errorSummaryListItem = this.element.$errorSummaryListItem;
                        // if there isn't already an error in the list create one, otherwise update the message
                        if (!$errorSummaryListItem) {
                            $errorSummaryListItem = getErrorListItem(this.element.id, errorMessage).appendTo($errorList);
                        } else {
                            $errorSummaryListItem.find('>label').html(errorMessage);
                        }
                        // link error list item to the field
                        this.element.$errorSummaryListItem = $errorSummaryListItem;

                        if ($fieldGroup.length > 0) {
                            fieldGroups.push($fieldGroup);
                        }
                    });
                }
                this.defaultShowErrors();
                $(fieldGroups).each(function () {
                    syncFieldGroupValidation(this);
                });
            }
		});
		
        return this.each(function(){
            var $self = $(this),
                $context = $self  || $body;
                attachValidationToForms($context);
        });
		
		
    };
}(window.jQuery));
