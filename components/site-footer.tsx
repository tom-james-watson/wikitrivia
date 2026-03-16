import classNames from "classnames";
import GitHubButton from "react-github-btn";
import * as ui from "../styles/ui.css";

interface Props {
  className?: string;
}

export default function SiteFooter(props: Props) {
  const { className } = props;

  return (
    <div className={classNames(ui.footerNotes, className)}>
      <div>
        All data sourced from{" "}
        <a
          href="https://www.wikidata.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wikidata
        </a>{" "}
        and{" "}
        <a
          href="https://www.wikipedia.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wikipedia
        </a>
        .
      </div>
      <div>
        Have feedback? Please report it on{" "}
        <a
          href="https://github.com/tom-james-watson/wikitrivia/issues/"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </div>
      <div className={ui.githubButtonSlot}>
        <GitHubButton
          href="https://github.com/tom-james-watson/wikitrivia"
          data-size="large"
          data-show-count="true"
          aria-label="Star tom-james-watson/wikitrivia on GitHub"
        >
          Star
        </GitHubButton>
      </div>
    </div>
  );
}
