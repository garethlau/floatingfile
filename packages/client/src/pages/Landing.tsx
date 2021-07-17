import React, { useState } from "react";
import { Colors } from "@floatingfile/common";
import { BASE_API_URL, VERSION } from "../env";
import axios from "axios";
import { useSnackbar, SnackbarOrigin } from "notistack";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import GInput from "../components/GInput";
import Button from "../components/Button";
import Seperator from "../components/Seperator";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useCreateSpace from "../mutations/useCreateSpace";
import Grid from "@material-ui/core/Grid";
import floatingfileLogoWhiteVariant from "../assets/images/floatingfile-white.png";
import useRandomElement from "../hooks/useRandomElement";

const anchorOrigin: SnackbarOrigin = {
  vertical: "top",
  horizontal: "center",
};

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    overflowY: "hidden",
    display: "flex",
    flexDirection: "row",
    backgroundColor: Colors.LIGHT_SHADE,
  },
  sidebar: {
    width: 0,
    display: "none",
    backgroundColor: Colors.MAIN_BRAND,
    [theme.breakpoints.up("sm")]: {},
    [theme.breakpoints.up("md")]: {
      width: "450px",
      display: "inherit",
    },
    [theme.breakpoints.up("lg")]: {
      width: "550px",
    },
  },
  content: {
    display: "flex",
    width: "100%",
    [theme.breakpoints.up("md")]: {
      flexDirection: "column",
    },
  },
  form: {
    height: "min-content",
    margin: "auto",
    width: "250px",
  },
  formInput: {
    margin: "10px 0px",
  },
  logo: {
    width: "30px",
  },
  brandName: {
    margin: 0,
    color: Colors.WHITE,
    textDecoration: "none",
  },
  phrase: {
    fontWeight: 600,
    fontSize: "45px",
    color: Colors.WHITE,
  },
  version: {
    color: Colors.WHITE,
    margin: 0,
    textDecoration: "none",
    fontSize: "14px",
  },
}));

const Landing: React.FC<void> = () => {
  const classes = useStyles();
  const history = useHistory();
  const [code, setCode] = useState("");
  const { mutateAsync: createSpace, isLoading: creatingSpace } =
    useCreateSpace();

  const phrase = useRandomElement([
    "Simplify your file transfer workflow.",
    "File transfer, simplified.",
    "The best of file transfer and file sharing.",
    "File sharing and file transfer in one.",
  ]);
  useDocumentTitle("floatingfile");

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length > 6) return;
    setCode(e.target.value.toUpperCase());
  }

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  async function join() {
    if (code.length !== 6) {
      enqueueSnackbar("Invalid code length.", {
        variant: "error",
        anchorOrigin,
      });
      return;
    }

    const format = /[ !@#$%^&*()_+\-=\]{};':"\\|,.<>?]/;

    if (format.test(code)) {
      // Contains special characters
      enqueueSnackbar("Invalid characters.", {
        variant: "error",
        anchorOrigin,
      });
      return;
    }

    try {
      await axios.get(`${BASE_API_URL}/api/v5/spaces/${code}`);
      enqueueSnackbar("Joining space.", {
        variant: "success",
        anchorOrigin,
      });
      setTimeout(() => {
        closeSnackbar();
        history.push(`/s/${code}`);
      }, 1500);
    } catch (err) {
      console.log(err);
      if (err.response.status === 404) {
        enqueueSnackbar("Space does not exist.", {
          variant: "error",
          anchorOrigin,
        });
      } else {
        enqueueSnackbar("There was an error.", {
          variant: "error",
          anchorOrigin,
        });
      }
    }
  }

  async function create() {
    try {
      const space = await createSpace();
      if (space && space.code) {
        history.push(`/s/${space.code}`);
      }
    } catch {
      enqueueSnackbar("There was an error.", {
        variant: "error",
        anchorOrigin,
      });
    }
  }

  return (
    <div className={classes.root}>
      <section className={classes.sidebar}>
        <Grid
          container
          direction="column"
          justify="center"
          style={{ flexWrap: "nowrap" }}
        >
          <Grid
            item
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
            style={{ padding: "20px" }}
            spacing={2}
          >
            <Grid item>
              <a href="https://floatingfile.space">
                <img
                  className={classes.logo}
                  src={floatingfileLogoWhiteVariant}
                  alt="The floatingfile logo in its white variant."
                />
              </a>
            </Grid>
            <Grid item>
              <a
                className={classes.brandName}
                href="https://floatingfile.space"
              >
                floatingfile
              </a>
            </Grid>
          </Grid>
          <Grid
            item
            container
            direction="column"
            justify="center"
            alignItems="center"
            style={{ padding: "20px", flexGrow: 1 }}
          >
            <Grid item>
              <p className={classes.phrase}>{phrase}</p>
            </Grid>
          </Grid>
          <Grid item style={{ padding: "20px" }}>
            <a
              className={classes.version}
              href="https://floatingfile.space/changelog"
            >
              {VERSION && `Version ${VERSION}`}
            </a>
          </Grid>
        </Grid>
      </section>
      <section className={classes.content}>
        <div className={classes.form}>
          <div className={classes.formInput}>
            <GInput
              onChange={handleCodeChange}
              value={code}
              placeholder="CODE"
              center
              fullWidth
              spellCheck={false}
              style={{ fontWeight: "bold", letterSpacing: "2px" }}
            />
          </div>
          <div className={classes.formInput}>
            <Button
              onClick={join}
              id="join-space-btn"
              variant="primary"
              fullWidth
              event={{ category: "Space", action: "Joined a space" }}
            >
              Join
            </Button>
          </div>

          <div style={{ margin: "20px 0" }}>
            <Seperator text="OR" />
          </div>

          <div className={classes.formInput}>
            <Button
              onClick={create}
              isLoading={creatingSpace}
              id="create-space-btn"
              variant="primary"
              fullWidth
              event={{ category: "Space", action: "Created a space" }}
            >
              Create a Space
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
