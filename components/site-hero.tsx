import * as ui from "../styles/ui.css";

interface Props {
  subtitle: string;
}

export default function SiteHero(props: Props) {
  const { subtitle } = props;

  return (
    <div className={ui.heroStack}>
      <h1 className={ui.heroWordmark}>Wikitrivia</h1>
      <p className={ui.heroTagline}>{subtitle}</p>
    </div>
  );
}
