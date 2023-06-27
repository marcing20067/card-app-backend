const mjml2html = require("mjml");
exports.getEmailHtml = (href, tokenType) =>
  mjml2html(`
<mjml>
    <mj-head>
      <mj-font name="Roboto" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700"></mj-font>
      <mj-title>Poliglot</mj-title>
      <mj-attributes>
        <mj-all font-family="Roboto" font-size="16px" line-height="125%" padding="0px" color="#00000099"></mj-all>
      </mj-attributes>
      <mj-style>.link a {
        display: block;
        color: black !important;
        text-decoration: none !important;
        padding: 8px 0 !important;
        }
      </mj-style>
    </mj-head>
    <mj-body>
      <mj-section padding="48px 0">
        <mj-column>
          <mj-text font-size="36px" font-weight="700" color="#ffad60">Poliglot</mj-text>
  
          <mj-text css-class="link"><a href="${href}" target="_blank" rel="noopener">
              Kliknij tutaj, aby ${email.text[tokenType]}!
            </a></mj-text>
          <mj-spacer height="8px"></mj-spacer>
          <mj-spacer height="1px" container-background-color="#000000"></mj-spacer>
          <mj-spacer height="22px"></mj-spacer>
          <mj-text font-size="14px">Dziękujemy za zaufanie!</mj-text>
          <mj-text font-size="14px">Mail został wygenerowany automatycznie. Prosimy na niego nie odpowiadać.</mj-text>
          <mj-spacer height="22px"></mj-spacer>
          <mj-spacer height="16px" container-background-color="#ffad60"></mj-spacer>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`).html;

const email = {
  text: {
    activation: "aktywować konto",
    resetPassword: "zresetować hasło",
    resetUsername: "zresetować nazwę użytkownika",
  },
  subject: {
    activation: "Poliglot | Aktywuj konto",
    resetPassword: "Poliglot | Zresetuj hasło",
    resetUsername: "Poliglot | Zresetuj nazwę użytkownika",
  },
};

exports.email = email;