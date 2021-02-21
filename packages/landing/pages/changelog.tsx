import { NextSeo } from "next-seo";
import Nav from "../src/components/Nav";
import Footer from "../src/components/Footer";
import EnterInView from "../src/wrappers/EnterInView";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import marked from "marked";
import { makeStyles } from "@material-ui/core/styles";

const Variants = {
  BODY: "BODY",
  BULLET: "BULLET",
  IMG: "IMG",
  LINE_BREAK: "LINE_BREAK",
  HEADER: "HEADER",
};

const WIP = [];

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#f1f3f9",
    minHeight: "100vh",
    paddingTop: "64px",
  },
  titleContainer: {
    textAlign: "center",
  },
  title: { marginTop: "50px" },
  contentContainer: { padding: "0 20px 100px" },
  changelogRecord: {
    maxWidth: "640px",
    margin: "auto",
    display: "grid",
    gridTemplateRows: "30px 30px auto",
    gridTemplateColumns: "1fr",
    gridTemplateAreas: "'version' 'date' 'changes'",
    marginTop: "50px",
    gridColumnGap: "20px",
    gridRowGap: "10px",
    [theme.breakpoints.up("md")]: {
      gridTemplateRows: "30px auto",
      gridTemplateColumns: "150px 550px",
      gridTemplateAreas: "'date version' 'none changes'",
    },
  },
  versionContainer: {
    gridArea: "version",
    "& > h2": {
      margin: 0,
    },
  },
  dateContainer: {
    gridArea: "date",
    opacity: 0.7,
    textAlign: "left",
    marginTop: "7px",
    [theme.breakpoints.up("md")]: {
      textAlign: "right",
    },
  },
  changesContainer: {
    gridArea: "changes",
    maxWidth: "100%",
    "& img": {
      width: "100%",
      borderRadius: "5px",
      boxShadow: theme.shadows[2],
    },
  },
}));

interface ChangelogRecord {
  version: string;
  data: any;
  htmlString: string;
}

const ChangelogPage: React.FC<{ changelog: ChangelogRecord[] }> = ({
  changelog,
}) => {
  const classes = useStyles();
  return (
    <>
      <NextSeo
        title={"floatingfile | Changelog"}
        description={"Stay up-to-date on changes to floatingfile."}
        openGraph={{
          url: "https://www.floatingfile.space/changelog",
          title: "floatingfile | Changelog",
          description: "Stay up-to-date on changes to floatingfile.",
        }}
      />
      <Nav />
      <div className={classes.root}>
        <div className={classes.titleContainer}>
          <h1 className={classes.title}>Changelog</h1>
        </div>
        <div className={classes.contentContainer}>
          {changelog.map((x, index) => {
            return (
              <EnterInView key={index}>
                <div className={classes.changelogRecord}>
                  <div className={classes.versionContainer}>
                    <h2>{x.version}</h2>
                  </div>
                  <div className={classes.dateContainer}>{x.data.date}</div>
                  <div className={classes.changesContainer}>
                    <div dangerouslySetInnerHTML={{ __html: x.htmlString }} />
                  </div>
                </div>
              </EnterInView>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
};

export async function getStaticProps() {
  const filenames = fs.readdirSync(path.join("src", "content", "changelog"));
  const changelog = filenames
    .map((filename) => {
      const rawMd = fs.readFileSync(
        path.join("src", "content", "changelog", filename)
      );
      const parsedMd = matter(rawMd);
      const htmlString = marked(parsedMd.content);

      return {
        version: "v" + filename.replace(".md", ""),
        data: parsedMd.data,
        htmlString,
        filename,
      };
    })
    .filter((change) => !change.data.WIP);

  changelog
    .sort((a, b) =>
      a.version
        .replace(/\d+/g, (n) => (+n + 100000).toString())
        .localeCompare(
          b.version.replace(/\d+/g, (n) => (+n + 100000).toString())
        )
    )
    .reverse();

  return {
    props: {
      changelog,
    },
  };
}

export default ChangelogPage;
