export default function() {
  return `
  <mjml>
    <mj-head>
      <mj-style>
        body {
          background-color: #f5f5f5;
        }
      </mj-style>
      <mj-style inline="inline">
        .mj-body {
          background-color: #f5f5f5;
        }
        .mj-header a, .mj-footer, .mj-footer a {
          color:#888;
          font-size:12px;
          text-decoration:none;
        }
        .mj-content {
          background-color:#fff;
          border-bottom:1px solid #ddd;
        }
      </mj-style>
    </mj-head>

    <mj-body css-class="mjml body">
      <mj-section css-class="content">
        <mj-column padding="0 30px">
          Daily Summary for the Inventory of 381 Store.
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`;
}
