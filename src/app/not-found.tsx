export default function NotFound() {
  return (
    <main id="main-content" className="site-container not-found" tabIndex={-1}>
      <p className="eyebrow">PAGE NOT FOUND · 404</p>
      <h1>Let’s get you<br />back on track.</h1>
      <p>This page doesn’t exist. You can explore our services or find contact information from the homepage.</p>
      <a className="button" href="/">Back to the homepage <span aria-hidden="true">↗</span></a>
    </main>
  );
}
