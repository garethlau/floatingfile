import React, { useState, useEffect, useMemo } from "react";
import { CorporateContactJsonLd, NextSeo } from "next-seo";
import { useRouter } from "next/router";
import {
  Accordion,
  AccordionButton,
  AccordionPanel,
  AccordionItem,
  AccordionIcon,
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  GridItem,
} from "@chakra-ui/react";
import PageTitle from "components/PageTitle";
import NavigationBar from "components/navigation-bar";
import Footer from "components/footer";
import path from "path";
import fs from "fs";
import { GetStaticProps, NextPage } from "next";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { findIndex } from "lodash";

interface Log {
  message: string;
  level: string;
  timestamp: string;
}

interface Data {
  logs: Log[];
}

const PERIOD = 31;

const DashboardPage: NextPage<Data> = ({ logs }) => {
  console.log(logs);

  const accessDataPoints = useMemo(() => {
    const distribution = {};
    const data = [];

    if (!logs) return [];
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - PERIOD);

    let index = 0;

    console.log(logs[logs.length - 2]);
    logs.every((log) => {
      const date = new Date(log.timestamp);

      if (date < weekAgo) {
        index++;
        return true;
      } else {
        console.log(weekAgo, date);
        return false;
      }
    });

    console.log("INDEX", index, logs.length);

    const weekLogs = logs.slice(index);

    weekLogs.forEach((log) => {
      // 2022-05-13T07:35:35.896Z
      const date = log.timestamp.split("T")[0];
      const freq = distribution[date] || {
        createSpace: 0,
        findSpace: 0,
        postdownload: 0,
        postupload: 0,
        predownload: 0,
        preupload: 0,
      };

      freq[log.message] = (freq[log.message] || 0) + 1;
      distribution[date] = freq;
    });
    Object.keys(distribution).map((date) => {
      let [_, month, day] = date.split("-");
      data.push({
        date: `${month}/${day}`,
        ...distribution[date],
        incompleteUploads:
          distribution[date].preupload - distribution[date].postupload,
        incompleteDownloads:
          distribution[date].predownload - distribution[date].postdownload,
      });
    });
    console.log(data);
    return data;
  }, [logs]);

  return (
    <>
      <NextSeo
        title={"floatingfile | FAQ"}
        description={"Frequently asked questions."}
        canonical={"https://www.floatingfile.space"}
        openGraph={{
          url: "https://www.floatingfile.space/faq",
          title: "floatingfile | FAQ",
          description: "Frequently asked questions.",
          images: [
            {
              url: "https://floatingfile.space/images/banner-blue-1200x600.jpg",
              width: 1200,
              height: 630,
              alt: "Use floatingfile today!",
            },
          ],
          site_name: "floatingfile",
        }}
      />

      <NavigationBar />
      <PageTitle>Status</PageTitle>
      <Container maxW="8xl">
        <SimpleGrid columns={[1, 1, 2]}>
          <GridItem colSpan={2} height="500px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={accessDataPoints}
                margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
              >
                <Legend
                  layout="horizontal"
                  verticalAlign="top"
                  align="center"
                />

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={45}
                  dy={10}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="createSpace"
                  stroke="#8884d8"
                  name="spaces created"
                />
                <Line
                  type="monotone"
                  dataKey="postupload"
                  stroke="#f67280"
                  name="files uploaded"
                />
                <Line
                  type="monotone"
                  dataKey="postdownload"
                  stroke="#76b81b"
                  name="files downloaded"
                />
              </LineChart>
            </ResponsiveContainer>
          </GridItem>
          <Box>
            <Text>Nice</Text>
          </Box>
          <Box>
            <Text>Nice</Text>
          </Box>
          <Box>
            <Text>Nice</Text>
          </Box>
        </SimpleGrid>
      </Container>

      <Box mb="240px"></Box>

      <Footer />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const raw = fs.readFileSync(
    path.join("content", "status", "05_14_2022.log"),
    "utf-8"
  );
  const logs = raw
    .split("\n")
    .map((s) => {
      try {
        return JSON.parse(s);
      } catch (error) {
        return null;
      }
    })
    .filter((log) => !!log);

  return {
    props: {
      logs,
    },
  };
};

export default DashboardPage;
