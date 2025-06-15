<!--
 * @Author: Allen
 * @Date: 2025-06-08 15:38:21
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-08 15:50:40
 * @FilePath: /yarbo_招聘/planning/01_Project_Foundation_and_UI_Kit.md
 * @Description: 
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
-->
# 阶段1: 项目基础与UI套件

## 1. 阶段目标
- 初始化项目结构。
- **集成并配置 `Shadcn/UI` 作为我们的核心组件库。**
- 创建网站的通用页头（Header）和页脚（Footer）。
- **产出**: 一个使用 `Shadcn/UI` 组件并包含通用布局的"空壳"网站。

## 2. 核心技术选型 (Tech Stack)
- **前端**: **Next.js**
- **后端及数据库**: **Supabase**
- **组件库**: **Shadcn/UI**
- **部署**: **Vercel**

## 3. 包含的用户故事
- **作为一名开发者**, 我希望有一个配置好的 `Shadcn/UI` 环境，以便我可以通过CLI快速添加新组件，并保持风格统一。
- **作为一名用户**, 我想要在网站的每一个页面都能看到一致的页头和页脚，以便我能方便地在不同板块间导航和了解公司信息。

## 4. 功能需求
- **Shadcn/UI 初始化**:
    - 运行 `npx shadcn@latest init`。
    - 配置 `globals.css` 和 `tailwind.config.ts` 以支持 `Shadcn/UI` 的主题和变量。
- **通用布局组件**:
    - **页头 (Header)**:
        - 使用 `Button` 组件（`variant="ghost"`）作为导航链接。
        - 使用 `Button` 组件（`variant="outline"`）作为管理员入口。
    - **页脚 (Footer)**:
        - 显示版权信息。
- **首页 (Home Page)**:
    - 使用 `Button` 组件作为主要的 "Call to Action"。

## 5. 非功能性需求
- **可维护性**: 组件的添加和维护应遵循 `Shadcn/UI` 的CLI流程，确保代码风格和结构的一致性。
- **性能**: 遵循 `Shadcn/UI` 的实践，确保组件是按需加载和优化的。

## 6. 技术实现说明
- 使用 `npx shadcn@latest add [component]` 命令来添加新组件。
- 在 `Header` 组件中，使用 `Button` 组件的 `asChild` 属性，将其与 Next.js 的 `Link` 组件结合，以实现带样式的导航。
- `Layout` 组件（在 `app/layout.tsx` 中实现）负责整合 `Header`, `children` 和 `Footer`。

## 7. 验收标准 (Acceptance Criteria)
- ✅ 项目已成功初始化 `Shadcn/UI`。
- ✅ `globals.css` 和 `tailwind.config.ts` 已根据 `Shadcn/UI` 的要求进行配置。
- ✅ `Header` 和 `Footer` 组件已创建，并使用 `Shadcn/UI` 的 `Button` 组件进行重构。
- ✅ 网站可以成功运行 (`npm run dev`)，没有编译错误。
- ✅ 首页正确显示，并包含一个由 `Shadcn/UI` 驱动的按钮。 