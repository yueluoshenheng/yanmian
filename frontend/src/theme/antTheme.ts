import type { ThemeConfig } from 'antd'
import { tokens } from './tokens'

export const antTheme: ThemeConfig = {
  token: {
    colorPrimary: tokens.amber500,
    colorBgContainer: tokens.bgSecondary,
    colorBgElevated: tokens.bgTertiary,
    colorBgLayout: tokens.bgPrimary,
    colorText: tokens.textPrimary,
    colorTextSecondary: tokens.textSecondary,
    colorBorder: tokens.border,
    colorBorderSecondary: tokens.border,
    colorBgSpotlight: tokens.bgHover,
    colorSuccess: tokens.statusGreen,
    colorWarning: tokens.statusYellow,
    colorError: tokens.statusRed,
    colorInfo: tokens.statusBlue,
    fontFamily: tokens.fontBody,
    borderRadius: 8,
    wireframe: false,
  },
  algorithm: undefined,
  components: {
    Layout: {
      headerBg: tokens.bgSecondary,
      siderBg: tokens.bgSecondary,
      bodyBg: tokens.bgPrimary,
      triggerBg: tokens.bgTertiary,
    },
    Menu: {
      darkItemBg: tokens.bgSecondary,
      darkItemSelectedBg: tokens.bgTertiary,
      darkItemHoverBg: tokens.bgHover,
      darkItemSelectedColor: tokens.amber500,
    },
    Card: {
      colorBgContainer: tokens.bgSecondary,
      colorBorderSecondary: tokens.border,
    },
    Button: {
      primaryColor: tokens.bgPrimary,
      colorPrimaryHover: tokens.amber400,
      colorPrimaryActive: tokens.amber600,
    },
    Input: {
      colorBgContainer: tokens.bgTertiary,
      activeBorderColor: tokens.borderFocus,
      hoverBorderColor: tokens.amber400,
    },
  },
}
