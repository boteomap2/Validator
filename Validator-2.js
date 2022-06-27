function Validator(formSelector) {
    let formRules = {};
    let validatorRules = {
        /**
         * nếu có lỗi thì return message
         * nếu ko có lỗi thì return `undefined`
         * @param {any} value
         */
        required: function (value) {
            return value ? undefined : "Vui lòng nhập trường này";
        },
        email: function (value) {
            let emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return emailPattern.test(value) ? undefined : "Vui lòng nhập email";
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`;
            };
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Vui lòng nhập nhiều nhất ${max} kí tự`;
            };
        },
        minmax: function (minmax) {
            return function (value) {
                let range = minmax.split("-");
                return value.length >= range[0] && value.length <= range[1]
                    ? undefined
                    : `Vui lòng nhập từ ${range[0]} đến ${range[1]} kí tự`;
            };
        },
    };

    //  Get form element from DOM
    let formElement = document.querySelector(formSelector);

    // Only process if form element is exist
    if (formElement) {
        let inputs = formElement.querySelectorAll("[name][rules]");
        for (let input of inputs) {
            let rules = input.getAttribute("rules").split("|");
            for (let rule of rules) {
                let ruleInfo;
                let ruleFunc;

                if (rule.includes(":")) {
                    ruleInfo = rule.split(":");
                    rule = ruleInfo[0];
                    ruleFunc = validatorRules[rule](ruleInfo[1]);
                } else {
                    ruleFunc = validatorRules[rule];
                }

                // lần check đầu tiên formRule rỗng
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }

            // add event listener
            input.onblur = handleValidate;
            input.oninput = handleClearWhileInput;
        }
    }
    // hàm handle lỗi
    function handleValidate(event) {
        let rules = formRules[event.target.name];
        let errorMessage;

        for (let rule of rules) {
            errorMessage = rule(event.target.value);
            if (errorMessage) break;
        }

        let formGroup = event.target.closest(".form-group");
        if (!formGroup) return;

        // nếu có lỗi thì hiển thị message lỗi, không thì hiển thị ok
        if (errorMessage) {
            formGroup.classList.add("invalid");
            if (formGroup.classList.contains("valid")) {
                formGroup.classList.remove("valid");
            }

            let fromMessage = formGroup.querySelector(".form-message");
            if (!fromMessage) return;
            fromMessage.innerText = errorMessage;
        }

        return !errorMessage;
    }

    // hàm clear message lỗi
    function handleClearWhileInput(event) {
        let formGroup = event.target.closest(".form-group");
        if (formGroup.classList.contains("invalid")) {
            formGroup.classList.remove("invalid");
        }

        let fromMessage = formGroup.querySelector(".form-message");
        if (!fromMessage) return;
        fromMessage.innerText = "";
    }

    // Xử lý hành vi submit form
    formElement.onsubmit = (event) => {
        event.preventDefault();

        let inputs = formElement.querySelectorAll("[name][rules]");
        let isValid = true;
        for (let input of inputs) {
            if (!handleValidate({ target: input })) {
                isValid = false;
            }
        }

        // khi không có lỗi thì submit form
        if (isValid) {
            if (typeof this.onSubmit === "function") {
                var enableInputs = formElement.querySelectorAll("[name]");
                var formValues = Array.from(enableInputs).reduce(function (values, input) {
                    switch (input.type) {
                        case "radio":
                            // nếu values đã có field này rồi thì skip
                            if (values.hasOwnProperty(input.name)) break;

                            let radioChecked = formElement.querySelector(
                                'input[name="' + input.name + '"]:checked'
                            );

                            // if found thì gán giá trị
                            if (!radioChecked) {
                                values[input.name] = "";
                            } else {
                                values[input.name] = radioChecked.value;
                            }
                            break;
                        case "checkbox":
                            // nếu values đã có field này rồi thì skip
                            if (values.hasOwnProperty(input.name)) break;
                            values[input.name] = [];

                            // lấy tất cả các input checked
                            let checkboxChecked = formElement.querySelectorAll(
                                'input[name="' + input.name + '"]:checked'
                            );

                            // nếu có checked, map từ element sang value
                            if (checkboxChecked) {
                                values[input.name] = Array.from(checkboxChecked).map(
                                    (x) => x.value
                                );
                            }

                            // nếu mảng rỗng, trả về chuỗi rỗng
                            if (values[input.name].length === 0) {
                                values[input.name] = "";
                            }
                            break;
                        case "file":
                            // type file nên trả về thuộc tính files
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value;
                    }

                    return values;
                }, {});
                formElement.reset();
                this.onSubmit(formValues);
            } else {
                formElement.submit();
            }
        }
    };

    // console.log(formRules);
}

export default Validator;
