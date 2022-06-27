import Validator from "./Validator.js";

window.onload = () => {
    let form = new Validator("#register-form");

    form.onSubmit = (formData) => {
        console.log(formData);
    };
};
