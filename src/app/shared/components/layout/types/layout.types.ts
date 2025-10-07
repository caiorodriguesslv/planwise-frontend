/**
 * Tipos específicos do layout
 */

export interface UserInfo {
  name: string;
  role: string;
  avatar?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  disabled?: boolean;
  badge?: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}
