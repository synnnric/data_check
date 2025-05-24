//NOTE: USING ROUTE
//
//example to use route
// this for route without children
// {
//   label: "Example",
//   key: "A",
//   icon: <PieChartOutlined />,
//   element: <Dashboard />,
//   link: "/",
// }
// this for route with child/children
// {
//   label: "Example Page",
//   key: "B",
//   icon: <DesktopOutlined />,
//   children: [
//     {
//       label: "Child Example",
//       key: "B1",
//       element: <ExamplePage />,
//       link: "/example",
//     },
//     {
//       label: "Child Example 2",
//       key: "B2",
//       element: <ExamplePage />,
//       link: "/example2",
//     },
//   ],
// },

import ExamplePage from "./layouts/Example-page/data";
// import Dashboard from "./layouts/dashboard";
import { DesktopOutlined, PieChartOutlined, UserOutlined } from "@ant-design/icons";
import DataPekerja from "./layouts/data-pekerja";
import DataDetail from "./layouts/data-detail";
import CariPekerja from "./layouts/cari-pekerja";
import ImportPekerja from "./layouts/import-pekerja";


export const mockdataRoutes = [
  {
    label: "Data Peserta BST FII",
    key: "A",
    icon: <PieChartOutlined />,
    element: <DataPekerja />,
    link: "/data-pekerja",
  },
  {
    label: "Detail Peserta",
    key: "B",
    icon: <UserOutlined />,
    element: <DataDetail />,
    link: "/data-detail",
  },
  {
    label: "Cari Peserta",
    key: "C",
    icon: <UserOutlined />,
    element: <CariPekerja />,
    link: "/cari-pekerja",
  },
  {
    label: "Import Peserta",
    key: "D",
    icon: <UserOutlined />,
    element: <ImportPekerja />,
    link: "/import-pekerja",
  },
  // {
  //   label: "Example Page",
  //   key: "B",
  //   icon: <DesktopOutlined />,
  //   children: [
  //     {
  //       label: "Data Pekerja",
  //       key: "B1",
  //       element: <DataPekerja />,
  //       link: "/data-pekerja",
  //     },
  //     {
  //       label: "Child Example 2",
  //       key: "B2",
  //       element: <ExamplePage />,
  //       link: "/example2",
  //     },
  //   ],
  // },
];
