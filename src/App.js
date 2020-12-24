import React, { useEffect, useState, Suspense } from "react";
import { makeStyles } from "@material-ui/core";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { Colors, Breakpoints } from "./constants";
import { USERNAME_STORAGE_KEY, BASE_API_URL, ENVIRONMENT, LAST_VISIT_STORAGE_KEY } from "./env";
import useWindowWidth from "./hooks/useWindowWidth";
import axios from "axios";
import { StateProvider } from "./store";
import ReactGA from "react-ga";

const Space = React.lazy(() => import("./pages/Space"));
const Landing = React.lazy(() => import("./pages/Landing"));
const SpaceValidator = React.lazy(() => import("./components/SpaceValidator"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const TestSpace = React.lazy(() => import("./pages/TestSpace"));

ReactGA.initialize("UA-159864166-1", { debug: ENVIRONMENT === "development" });

axios.defaults.headers.common["api-key"] = "secretcat";

const useStyles = makeStyles((theme) => ({
	root: {
		maxWidth: "100%",
		minHeight: "100vh",
		overflowX: "hidden",
	},
	success: {
		backgroundColor: Colors.SUCCESS,
	},
	error: {
		backgroundColor: Colors.DANGER,
	},
	warning: {
		backgroundColor: Colors.WARNING,
	},
	info: {
		backgroundColor: Colors.DARK_ACCENT,
	},
}));

const App = () => {
	const classes = useStyles();
	const windowWidth = useWindowWidth();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const lastVisit = localStorage.getItem(LAST_VISIT_STORAGE_KEY);
		let threeHoursAgo = new Date();
		threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
		let username = localStorage.getItem(USERNAME_STORAGE_KEY);
		if (!username || !lastVisit || new Date(lastVisit) < new Date(threeHoursAgo)) {
			// Generate new username
			axios.get(`${BASE_API_URL}/api/v3/nickname`).then((res) => {
				localStorage.setItem(USERNAME_STORAGE_KEY, res.data.username);
				axios.defaults.headers.common["username"] = res.data.username;
				setLoading(false);
			});
		} else {
			// Use previous username
			axios.defaults.headers.common["username"] = username;
			setLoading(false);
		}
	}, []);

	if (loading) {
		return <div style={{ width: "100vw", height: "100vh", backgroundColor: Colors.LIGHT_SHADE }}></div>;
	} else {
		return (
			<div className={classes.root}>
				<SnackbarProvider
					maxSnack={3}
					classes={{
						variantSuccess: classes.success,
						variantError: classes.error,
						variantWarning: classes.warning,
						variantInfo: classes.info,
					}}
					anchorOrigin={{
						vertical: windowWidth > Breakpoints.MD ? "bottom" : "top",
						horizontal: windowWidth > Breakpoints.MD ? "right" : "center",
					}}
				>
					<header className="App-header">
						<Router>
							<Suspense fallback={null}>
								<Switch>
									<Route exact path="/" component={Landing} />
									<Route path="/s">
										<StateProvider>
											<SpaceValidator>
												<Space />
											</SpaceValidator>
										</StateProvider>
									</Route>
									<Route path="/t">
										<TestSpace />
									</Route>
									<Route component={NotFound} />
								</Switch>
							</Suspense>
						</Router>
					</header>
				</SnackbarProvider>
			</div>
		);
	}
};

export default App;
