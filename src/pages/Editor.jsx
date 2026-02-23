import LayoutContextProvider from "../context/LayoutContext";
import TransformContextProvider from "../context/TransformContext";
import TablesContextProvider from "../context/DiagramContext";
import UndoRedoContextProvider from "../context/UndoRedoContext";
import SelectContextProvider from "../context/SelectContext";
import AreasContextProvider from "../context/AreasContext";
import NotesContextProvider from "../context/NotesContext";
import TypesContextProvider from "../context/TypesContext";
import SaveStateContextProvider from "../context/SaveStateContext";
import EnumsContextProvider from "../context/EnumsContext";
import WorkSpace from "../components/Workspace";
import TopBar from "../components/TopBar";
import { useThemedPage } from "../hooks";

export default function Editor() {
  useThemedPage();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar />
      <div style={{ flex: 1, minHeight: 0 }}>
        <LayoutContextProvider>
      <TransformContextProvider>
        <UndoRedoContextProvider>
          <SelectContextProvider>
            <AreasContextProvider>
              <NotesContextProvider>
                <TypesContextProvider>
                  <EnumsContextProvider>
                    <TablesContextProvider>
                      <SaveStateContextProvider>
                        <WorkSpace />
                      </SaveStateContextProvider>
                    </TablesContextProvider>
                  </EnumsContextProvider>
                </TypesContextProvider>
              </NotesContextProvider>
            </AreasContextProvider>
          </SelectContextProvider>
        </UndoRedoContextProvider>
      </TransformContextProvider>
    </LayoutContextProvider>
      </div>
    </div>
  );
}
