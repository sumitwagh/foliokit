import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Template license" };

export default function License() {
  return (
    <>
      <h1>Template license</h1>
      <p>Every template from {site.name}, free or paid, comes with this personal portfolio license.</p>
      <h2>You can</h2>
      <ul>
        <li>Use the template to build one portfolio website, for yourself or for one client.</li>
        <li>Change anything: text, colours, fonts, layout and code.</li>
        <li>Use that website commercially, for example to win jobs or clients.</li>
      </ul>
      <h2>You can&apos;t</h2>
      <ul>
        <li>Resell, give away or share the template files, modified or not.</li>
        <li>Offer the template, or something derived from it, in another template shop, marketplace or bundle.</li>
        <li>Use one license for more than one website.</li>
      </ul>
      <h2>More than one site?</h2>
      <p>Buy one license per website, or get the All-Access Pass for every template.</p>
      <p>
        Fonts used in the templates come from Google Fonts under the SIL Open Font License. The sample names, companies and numbers inside the
        templates are fictional placeholders.
      </p>
    </>
  );
}
