/**
 * @jest-environment jsdom
 */

import { screen, within } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";


import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";
import store from "../__mocks__/store.js";
import { bills } from "../fixtures/bills.js"; // Importing bills fixtures

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      const html = NewBillUI()
      document.body.innerHTML = html;
      Object.defineProperty(window, 'localStorage', { value: localStorageMock }); // Simulating employee connection before each test
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}));
    })
    test("If form is submitted, handleSubmit function should be called", () => {
      const newBillPage = new NewBill({ document, onNavigate, store, localStorage: window.localStorage }); // Setting newBill page
      const handleSubmit = jest.fn(newBillPage.handleSubmit); // Simulating handleSubmit function
      const submitButton = screen.getByText("Envoyer"); // Retrieving of submit button by Text
      const newBillForm = screen.getByTestId("form-new-bill"); // Retrieving of Form by test-id 
      newBillForm.addEventListener("submit", handleSubmit); // Listening to submit event on newBillForm. Submit event should trigger the handleSubmit function
      userEvent.click(submitButton); // Simulating user click on submit button
      expect(handleSubmit).toHaveBeenCalled(); // Expecting the handleSubmit function to have been called when submit button has been clicked
    })
    test("If file input value change, handleChangeFile function should be called", () => {
      const newBillPage = new NewBill({ document, onNavigate, store, localStorage: window.localStorage }); // Setting newBill page
      const handleChangeFile = jest.fn(newBillPage.handleChangeFile); // Simulating handleChangeFile function
      const input = screen.getByTestId("file"); // Retrieving of input by test-id
      input.addEventListener("change", handleChangeFile); // Listening to change event on input
      const file = {name: 'test.png', type: 'image/png'}; // mocking file
      userEvent.upload(input, file); // Simulating user file upload
      expect(handleChangeFile).toHaveBeenCalled(); // Expecting handleChangeFile function to habe been called when user has upload a file
    })
    test("If file type is different from image, value should be cleared", () => {
      const newBillPage = new NewBill({ document, onNavigate, store, localStorage: window.localStorage }); // Setting newBill page
      const handleChangeFile = jest.fn(newBillPage.handleChangeFile); // Simulating handleChangeFile function
      const input = screen.getByTestId("file"); // Retrieving of input by test-id
      input.addEventListener("change", handleChangeFile); // Listening to change event on input
      const file = {name: 'test.txt', type: 'text/plain'}; // mocking wrong file
      userEvent.upload(input, file); // Simulating user file upload
      expect(input.value).toEqual(""); // Expecting input to be cleared when file has wrong type
    })
  })
})

// NEW BILL POST TEST
describe('User is connected as an employee and submits new bill form with fields properly filled', () => {
  test('user should be redirected', async () => {
    const newBill = new NewBill({document, onNavigate, store, localStorage: window.localStorage});
    const fixtureData = bills[1]; //
    const form = screen.getByTestId("form-new-bill");
    const handleSubmit = jest.fn(newBill.handleSubmit);   
    const imageInput = screen.getByTestId("file");
    const expenseInput = screen.getByTestId('expense-name');
    const amountInput = screen.getByTestId('amount');
    const dateInput = screen.getByTestId("datepicker");
    const vatInput = screen.getByTestId("vat");
    const pctInput = screen.getByTestId("pct");
    const detailsInput = screen.getByTestId("commentary");
    const file = {name: 'test.png', type: 'image/png'};
    userEvent.type(expenseInput, fixtureData.name);
    userEvent.type(amountInput, fixtureData.amount.toString());
    userEvent.type(dateInput, fixtureData.date);
    userEvent.type(vatInput, fixtureData.vat.toString());
    userEvent.type(pctInput, fixtureData.pct.toString());
    userEvent.type(detailsInput, fixtureData.commentary);
    await userEvent.upload(imageInput, file);
    const submitBtn = screen.getByTestId('submit-btn')
    form.addEventListener("submit", handleSubmit);
    userEvent.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const heading = screen.getByText('Mes notes de frais');
    expect(heading).toBeTruthy()
  });
})
