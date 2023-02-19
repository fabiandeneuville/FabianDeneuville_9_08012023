/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { ROUTES } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

import store from "../__mocks__/store";

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true) // Checking if windowIcon HTML element has active-icon class
    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Bills should be fetched from mocked API", async () => {
      document.body.innerHTML = BillsUI({ data: []});
      const BillsDashBoard = new Bills({document, onNavigate, store, localStorage: window.localStorage});
      const spy = jest.spyOn(BillsDashBoard, "getBills");
      await BillsDashBoard.getBills();
      expect(spy).toHaveBeenCalledTimes(1);
    })
  })

  describe("When new bill button is clicked", () => {
    test("user should navigate to new bill page", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      document.body.innerHTML = BillsUI({ data: bills});
      const BillsDashBoard = new Bills({document, onNavigate, store, localStorage: window.localStorage});
      const newBillButton = screen.getByTestId('btn-new-bill');
      const handleClickOnNewBillButton = jest.fn(BillsDashBoard.handleClickNewBill);
      newBillButton.addEventListener("click", handleClickOnNewBillButton);
      userEvent.click(newBillButton);
      expect(handleClickOnNewBillButton).toHaveBeenCalled();
    })
  })

  describe("When user clicks on eye icon", () => {
    test("a modal should be displayed", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}));
      document.body.innerHTML = BillsUI({ data: bills});
      const BillsDashBoard = new Bills({document, onNavigate, store, localStorage: window.localStorage});
      const icon = screen.getAllByTestId("icon-eye")[0];
      const handleClickOnEyeIcon = jest.fn(BillsDashBoard.handleClickIconEye(icon));
      icon.addEventListener("click", handleClickOnEyeIcon);
      userEvent.click(icon);
      expect(handleClickOnEyeIcon).toHaveBeenCalled();
    })
  })

  describe('When an error occures', () => {
    beforeEach(() => {
      jest.spyOn(store, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("bills fetching fails with a 404 status response", async () => {
      store.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Error 404"))
          }
        }
      })
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    })
    test("bills fetching fails with a 500 status response", async () => {
      store.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })
      document.body.innerHTML = BillsUI({ error: 'Erreur 500' });
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    })
  })
})
