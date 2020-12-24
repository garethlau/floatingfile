import puppeteer from "puppeteer"; // 1

let browser;
let page;

const URL = "http://localhost:3000";

const options = {
	width: "1200",
	height: "960",
};

beforeAll(async () => {
	jest.setTimeout(30000);
	browser = await puppeteer.launch({
		headless: true,
		args: [`--window-size=${options.width},${options.height}`],
	});
	page = await browser.newPage();
	await page.goto("http://localhost:3000/");
});

it("opens landing page without crashing", async () => {
	await page.goto(URL);
});

it("creates a new space", async () => {
	await page.goto(URL);
	await page.waitForSelector("#create-space-btn");
	await page.click("#create-space-btn");
});

afterAll(() => {
	browser.close();
});
