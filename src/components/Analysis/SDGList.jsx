import React, { useState } from "react";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { sdgColors } from "../utils.js";

function SDGList({ relevantParagraphs }) {
  const [activeKey, setActiveKey] = useState(null);

  const handleSelect = (sdgNumber) => {
    setActiveKey(sdgNumber === activeKey ? null : sdgNumber); // Toggle active state
  };

  const getSDGColor = (sdgNumber) => {
    return sdgColors[sdgNumber] || "grey"; // Default color if SDG number is not in the list
  };

  // Function to calculate the height of the textarea
  const calculateHeight = (text) => {
    const averageLineLength = 40; // Adjust this value based on your average line length
    const lineHeight = 12; // Adjust this for your line height
    const lines = Math.ceil(text.length / averageLineLength);
    return Math.max(lines * lineHeight, 40); // Minimum height of 60px
  };

  return (
    <div>
      {Object.entries(relevantParagraphs).map(([sdgNumber, paragraph]) => (
        <InputGroup
          key={sdgNumber}
          onClick={() => handleSelect(sdgNumber)}
          style={{
            marginBottom: "10px",
            backgroundColor:
              activeKey === sdgNumber ? getSDGColor(sdgNumber) : "",
            color: activeKey === sdgNumber ? "white" : "black",
          }}
        >
          <InputGroup.Text
            style={{
              backgroundColor: getSDGColor(sdgNumber),
              color: "white",
              borderColor: "lightgray",
              width: "80px",
            }}
          >
            SDG {sdgNumber}
          </InputGroup.Text>
          <Form.Control
            as="textarea"
            value={paragraph}
            readOnly
            style={{
              backgroundColor:
                activeKey === sdgNumber ? "lightgray" : "#fffbf5",
              height: `${calculateHeight(paragraph)}px`,
              borderColor: "lightgray",
            }}
          />
        </InputGroup>
      ))}
    </div>
  );
}

export default SDGList;
