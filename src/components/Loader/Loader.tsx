import styles from "./Loader.module.css";

interface Props {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  local?: boolean;
}

function Loader({ width = 100, height = 100, style, local }: Props) {
  const containerStyle: React.CSSProperties = local
    ? {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        ...style,
      }
    : {
        width,
        height,
        position: "fixed",
        bottom: "10px",
        right: "10px",
        ...style,
      };

  const svgContainerStyle: React.CSSProperties = local
    ? {
        width,
        height,
      }
    : {
        width: "100%",
        height: "100%",
      };

  return (
    <div style={containerStyle}>
      <svg
        xmlSpace="preserve"
        viewBox="0 0 100 100"
        y="0px"
        x="0px"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        xmlns="http://www.w3.org/2000/svg"
        id="圖層_1"
        version="1.1"
        style={{
          ...svgContainerStyle,
          margin: "initial",
          display: "block",
          shapeRendering: "auto",
          background: "rgb(255, 255, 255)",
        }}
        preserveAspectRatio="xMidYMid"
        width={200}
        height={200}
      >
        <g
          className="ldl-scale"
          style={{
            transformOrigin: "50% 50%",
            transform: "rotate(0deg) scale(0.8, 0.8)",
          }}
        >
          <g className="ldl-ani">
            <g className="ldl-layer">
              <g className={`ldl-ani ${styles.animate} ${styles.animate1}`}>
                <path
                  d="M38.36,70H13.64C9.42,70,6,66.58,6,62.36V37.64C6,33.42,9.42,30,13.64,30h24.72c4.22,0,7.64,3.42,7.64,7.64v24.72 C46,66.58,42.58,70,38.36,70z"
                  strokeMiterlimit="10"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="#000000"
                  fill="#FFFFFF"
                ></path>
              </g>
            </g>
            <g className="ldl-layer">
              <g className={`ldl-ani ${styles.animate} ${styles.animate2}`}>
                <circle
                  r="5.89"
                  cy="50"
                  cx="26"
                  strokeMiterlimit="10"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="#000000"
                  fill="#E15C64"
                ></circle>
              </g>
            </g>
            <g className="ldl-layer">
              <g className={`ldl-ani ${styles.animate} ${styles.animate3}`}>
                <path
                  d="M94,37.64v24.72c0,4.22-3.42,7.64-7.64,7.64H61.64C57.42,70,54,66.58,54,62.36V37.64c0-4.22,3.42-7.64,7.64-7.64h24.72 C90.58,30,94,33.42,94,37.64z"
                  strokeMiterlimit="10"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="#000000"
                  fill="#FFFFFF"
                ></path>
              </g>
            </g>
            <g className="ldl-layer">
              <g className={`ldl-ani ${styles.animate} ${styles.animate4}`}>
                <circle
                  r="4.05"
                  cy="50"
                  cx="74"
                  strokeMiterlimit="10"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="#000000"
                  fill="#333333"
                ></circle>
              </g>
            </g>
            <g className="ldl-layer">
              <g className={`ldl-ani ${styles.animate} ${styles.animate5}`}>
                <circle
                  r="4.05"
                  cy="59.57"
                  cx="64.43"
                  strokeMiterlimit="10"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="#000000"
                  fill="#333333"
                ></circle>
              </g>
            </g>
            <g className="ldl-layer">
              <g className={`ldl-ani ${styles.animate} ${styles.animate6}`}>
                <circle
                  r="4.05"
                  cy="40.43"
                  cx="83.57"
                  strokeMiterlimit="10"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="#000000"
                  fill="#333333"
                ></circle>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export default Loader;
