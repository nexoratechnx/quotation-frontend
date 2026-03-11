export default function Logo({ height = 36 }) {
    const width = height * 2.5;
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 500 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="nxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b97a7f" />
                    <stop offset="100%" stopColor="#e8c6c9" />
                </linearGradient>
            </defs>
            <text
                x="50%"
                y="60%"
                textAnchor="middle"
                fontSize="160"
                fontFamily="Times New Roman, serif"
                fill="url(#nxGradient)"
                fontWeight="600"
            >
                NX
            </text>
        </svg>
    );
}
