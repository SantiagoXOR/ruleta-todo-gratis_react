import { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export type IconComponent = React.FC<IconProps>;

export interface Icons {
  Gift: IconComponent;
  Tag: IconComponent;
  Card: IconComponent;
  Paint: IconComponent;
  Star: IconComponent;
  Clock: IconComponent;
  Share: IconComponent;
  Document: IconComponent;
}
