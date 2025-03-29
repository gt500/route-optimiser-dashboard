
// Icons.ts - Utility functions for creating custom map icons

interface LocationIconOptions {
  text: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  size?: number;
}

/**
 * Creates HTML for a custom location marker
 */
export const createLocationIcon = (options: LocationIconOptions): string => {
  const {
    text,
    backgroundColor,
    textColor,
    borderColor,
    size = 28
  } = options;

  return `
    <div style="
      background-color: ${backgroundColor};
      color: ${textColor};
      border: 2px solid ${borderColor};
      width: ${size}px;
      height: ${size}px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      font-size: ${size * 0.45}px;
      font-weight: bold;
      box-shadow: 0 1px 5px rgba(0,0,0,0.2);
      text-align: center;
    ">
      ${text}
    </div>
  `;
};
