import React from "react";
import {
  BarChart,
  PieChart,
  Pie,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { Row, Col, Card, Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouseChimneyWindow,
  faArrowUpFromGroundWater,
  faSolarPanel,
  faRecycle,
  faUserGroup,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { sdgColors } from "../utils.js";

import SDGList from "./SDGList.jsx";

function PdfAnalysis({ analysisData }) {
  // prepare data for keyword counts
  const keywordCounts = analysisData.keyword_counts;
  const CategoryClaims = analysisData.category_claims;
  const relevantParagraphs = analysisData.relevant_paragraphs;

  const data = Object.keys(keywordCounts).map((key) => ({
    name: key,
    count: keywordCounts[key],
  }));

  const categoryIcons = {
    emissions: faHouseChimneyWindow,
    resources: faArrowUpFromGroundWater,
    energy: faSolarPanel,
    waste: faRecycle,
    employees: faUserGroup,
    audit: faMagnifyingGlass,
  };

  const positiveSDGs = data.filter((item) => item.count > 0);

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Card as={Col} className="border-0 bg-transparent">
          <Card.Body>
            <Card.Title>Keyword Counts</Card.Title>
            <BarChart width={500} height={250} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={sdgColors[parseInt(entry.name)] || "#000000"}
                  />
                ))}
              </Bar>
            </BarChart>
          </Card.Body>
        </Card>
        <Card as={Col} className="border-0 bg-transparent">
          <Card.Title>Keyword Percentage</Card.Title>
          <Card.Body>
            <PieChart width={500} height={250}>
              <Pie
                data={positiveSDGs}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={90}
                fill="#8884d8"
                dataKey="count"
              >
                {positiveSDGs.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={sdgColors[parseInt(entry.name)] || "#000000"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Card.Body>
        </Card>
      </Row>
      <Row className="justify-content-md-center mt-5 mb-5">
        {Object.keys(categoryIcons).map((category) => (
          <Col md={2} key={category} className="mb-4">
            <Card className="border-0 bg-transparent text-center">
              <Card.Header className="bg-transparent pb-3">
                <FontAwesomeIcon
                  icon={categoryIcons[category]}
                  style={{ color: "gray", fontSize: "3em" }}
                />
              </Card.Header>
              <Card.Body>
                <Card.Title
                  className="mb-3"
                  style={{ color: "gray", fontWeight: "bold" }}
                >
                  {category}
                </Card.Title>
                <Card.Text className="small">
                  {CategoryClaims[category]}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Row>
        <SDGList relevantParagraphs={relevantParagraphs} />
      </Row>
    </Container>
  );
}

export default PdfAnalysis;

<FontAwesomeIcon icon="fa-solid fa-house-chimney-window" />;
