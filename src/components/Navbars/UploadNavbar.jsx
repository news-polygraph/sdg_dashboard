import React, { Component } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Button, Container } from "react-bootstrap";

class UploadNavbar extends Component {
  constructor(props) {
    super(props); // passes data to parent component
    const { onSelectPdf } = this.props;

    this.onSelectPdf = onSelectPdf;

    this.state = {
      title: "",
      file: null,
    };
  }

  submitPdf = async (e) => {
    const { title, file } = this.state;
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    const result = await axios.post("http://localhost:3001/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (result.data.status === "ok") {
      console.log("Uploaded Successfully!!!");
      // getPdf();
    }
    // request pdf and page data and show
    this.onSelectPdf(title, file);
  };

  render() {
    return (
      <Container fluid>
        <Form onSubmit={this.submitPdf}>
          <Row className="py-4">
            <Col xs={12} md={4}>
              <Form.Group controlId="formPlaintextPassword" className="h-100">
                <Form.Control
                  type="text"
                  placeholder="Document Title"
                  required
                  className="h-100"
                  onChange={(e) => this.setState({ title: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group as={Col} controlId="formFile" className="h-100">
                <Form.Control
                  type="file"
                  accept="application/pdf"
                  required
                  className="h-100"
                  onChange={(e) => this.setState({ file: e.target.files[0] })}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Button
                variant="outline-secondary"
                type="submit"
                className="h-100 btn-custom"
              >
                Submit
              </Button>{" "}
            </Col>
          </Row>
        </Form>
      </Container>
    );
  }
}
UploadNavbar.defaultProps = {
  onSelectPdf: "",
};
UploadNavbar.propTypes = {
  onSelectPdf: PropTypes.func,
};

export default UploadNavbar;
