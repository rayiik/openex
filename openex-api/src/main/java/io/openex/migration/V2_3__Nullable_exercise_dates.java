package io.openex.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Statement;

@Component
public class V2_3__Nullable_exercise_dates extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Statement select = context.getConnection().createStatement();
        select.execute("ALTER TABLE injects DROP column inject_date;");
        select.execute("ALTER TABLE exercises ALTER COLUMN exercise_start_date DROP NOT NULL ");
        select.execute("ALTER TABLE exercises ALTER COLUMN exercise_end_date DROP NOT NULL ");
    }
}
