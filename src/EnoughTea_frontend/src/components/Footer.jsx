import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <div id="footer">
      <footer>
        <Container fluid="md">
          <Row>
            <Col>
              <p className="footer-text">
                The ICP's largest digital marketplace for crypto
                collectibles and NFTs. Buy, sell, and
                discover exclusive digital items.
              </p>
            </Col>
            <Col>
              <a href="https://github.com/waleedGeorgy/EnoughTea-Smixels"><img id="github-icon" src="../../github-icon.svg" alt="github icon" /></a>
            </Col>
            <Col>
              <p className="footer-copyright">Copyright ⓒ {year}</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}
