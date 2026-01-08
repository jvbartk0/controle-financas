import { Layout } from "@/components/Layout";
import { TagsManager } from "@/components/TagsManager";
import { CategoriesManager } from "@/components/CategoriesManager";
import { PreferencesSettings } from "@/components/PreferencesSettings";
import { ExportData } from "@/components/ExportData";

export default function Settings() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <CategoriesManager />
            <TagsManager />
          </div>
          <div className="space-y-6">
            <PreferencesSettings />
            <ExportData />
          </div>
        </div>
      </div>
    </Layout>
  );
}
