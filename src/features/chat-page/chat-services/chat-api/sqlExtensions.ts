import { ServerActionResponse } from "@/features/common/server-action-response";
import { AzureKeyCredential } from "@azure/core-auth";
// import { OpenAIClient, ChatRequestSystemMessage } from "@azure/openai";
import * as sql from "mssql";
import { OpenAIInstance } from "../../../common/services/openai";

interface AIQuery {
  summary: string;
  query: string;
}

export const executeCreateSQLQuery = async (
  args: { prompt: string },
  userPrompt: string,
  threadId: string,
  signal: AbortSignal
): Promise<ServerActionResponse<any>> => {
  console.log("🟢 Executing SQL query with prompt:", userPrompt, args.prompt);
  const openAI = OpenAIInstance();

  // Definiere die Systemnachricht mit dem DB-Schema
  const systemMessage = `Your are a helpful, cheerful database assistant. 
  Use the following database schema when creating your answers:

  - dbo.__ABRECHNUNGEFMigrationsHistory (MigrationId, ProductVersion )
  - dbo.__APPLICATIONSERVICEEFMigrationsHistory (MigrationId, ProductVersion )
  - dbo.__DatabaseEFMigrationsHistory (MigrationId, ProductVersion )
  - dbo.__DEVOPSEFMigrationsHistory (MigrationId, ProductVersion )
  - dbo.__INVOICESERVICEEFMigrationsHistory (MigrationId, ProductVersion )
  - dbo.__ORDERSERVICEEFMigrationsHistory (MigrationId, ProductVersion )
  - dbo.__PLATTFORMEFMigrationsHistory (MigrationId, ProductVersion )
  - dbo.__PQCEFMigrationsHistory (MigrationId, ProductVersion )
  - dbo.__SKILLMANAGEMENTSERVICEEFMigrationsHistory (MigrationId, ProductVersion )
  - dbo.__TEAMSEFMigrationsHistory (MigrationId, ProductVersion )
  - dbo.Activity (CreatedOn, Description, HoursToBill, Id, InvoiceDetailId, ModifiedOn, TeamIterationId, TimeBookingId )
  - dbo.ApplicationGroup (CreatedBy, CreatedOn, Id, Name, SortOrder, UpdatedBy, UpdatedOn )
  - dbo.ApplicationNotification (ApplicationPageId, CreatedBy, CreatedOn, Description, Id, UpdatedBy, UpdatedOn )
  - dbo.ApplicationPage (Caption, CreatedBy, CreatedOn, GroupId, Id, InternalName, IsActive, IsInternal, ParentId, Path, SortOrder, SvgIcon, Title, UpdatedBy, UpdatedOn, Url )
  - dbo.AppRight (ApplicationPageId, CreatedBy, CreatedOn, Description, Domain, Id, Name, UpdatedBy, UpdatedOn )
  - dbo.Attachment (BlobStorageContainer, BlobStorageFileName, Category, CreatedBy, CreatedOn, EntityId, EntityType, FileName, Id, UpdatedBy, UpdatedOn )
  - reporting.AuftragForecast (AuftragBez, AuftragEingangsbetrag, AuftragGesamtbetrag, AuftragNr, AuftragStatus, BuchungsMonat, BusinessUnit, CRMTicketing, DeltaGesamtbetragUmsatz, GeändertAm, GFVerantwortung, IstPlanungsprojekt, KPI_Auftragsstatus, KPI_Ticketing, KPI_Turnover, Kunde, KundeArt, MeilensteinName, Produktgruppe, RechnungMehrereZeiträume, RechnungsNr, Tagessatz, Team, TeamprojektPfad, Umsatz, UmsatzUngewichtet, Verantwortlich, VerantwortlichEMail, VerkaufschancenNr, Vertragsart, Wahrscheinlichkeit, WebURL )
  - dbo.BusinessUnit (BULeaderObjectId, CreatedBy, CreatedOn, Id, IsDeprecated, Name, UpdatedBy, UpdatedOn )
  - dbo.Capacity (CapacityPerDay, ConsultingRoleId, CreatedOn, DaysOff, EmployeeId, Id, ModifiedOn, PlannedTurnover, SalesorderId, TeamIterationId )
  - dbo.CareerLevel (CreatedBy, CreatedOn, Id, Name, Order, RefId, UpdatedBy, UpdatedOn )
  - dbo.Category (CreatedBy, CreatedOn, Description, Id, ModifiedOn, Name, Status, Type, UpdatedBy )
  - dbo.CategorySkill (CategoryId, CreatedBy, CreatedOn, Id, ModifiedOn, SkillId, UpdatedBy )
  - dbo.CategoryTeam (CategoryId, CreatedBy, CreatedOn, Id, ModifiedOn, TeamId, UpdatedBy )
  - dbo.Comments (ApplicationPageId, Content, CreatedBy, CreatedOn, EmployeeId, EntityId, EntityType, Id, IsOpen, OwnerId, ParentId, Path, UpdatedBy, UpdatedOn )
  - dbo.Config (CreatedOn, Id, ModifiedOn, Name, Value )
  - dbo.ConsultingRole (CreatedOn, CustomerNumber, Id, ModifiedOn, Name, Quantity, QuantityTravelAllowance, Rate, RateTravelAllowance, SalesorderId )
  - dbo.Customer (CreatedOn, Id, Internal, ModifiedOn, Name, Number, RefId, ShortName )
  - dbo.DaysOff (CapacityId, CreatedOn, Duration, End, Id, ModifiedOn, Start )
  - dbo.Employee (Abbreviation, AvatarUrl, BusinessCardDescription, BusinessUnitId, CareerLevelId, ConsultingLevel, CreatedOn, Email, EntranceDatePermanentEmployee, EntranceDateTrainee, FirstName, FullTimeEquivalent, Id, IsActive, IsExternal, IsZeitAdmin, LastName, Location, LocationId, MentorId, ModifiedOn, MSAADObjectId, Name, OrganizationUnit, RefId, Salutation, Type, TypeId, Upn, WorkingDaysPerWeek, WorkingHoursPerDay )
  - dbo.EmployeeCategory (CreatedBy, CreatedOn, Id, IsShownInPeople, Name, NameFemale, NameMale, NameNeutral, RefId, UpdatedBy, UpdatedOn )
  - dbo.EmployeeConsents (CreatedBy, CreatedOn, EmployeeId, Id, ModifiedOn, SkillsPublic, UpdatedBy )
  - dbo.EmployeeSettings (CreatedOn, DefaultLocation, EmployeeId, FavoriteSalesorderId, Id, ModifiedOn, ShowCustomerColumn, ShowDayHoursColumn, ShowEndColumn, ShowLocationColumn, ShowOffTimeColumn, ShowStartColumn )
  - dbo.EmployeeType (CategoryId, CreatedBy, CreatedOn, Id, Name, UpdatedBy, UpdatedOn )
  - DevOps.Entitlement (AccountLicenseType, AssignmentSource, DateCreated, EntityCreatedAt, EntityModifiedAt, ID, LastAccessedDate, LicenseDisplayName, LicensingSource, MsdnLicenseType, OrganisationID, Status, StatusMessage, UserMailAddress )
  - dbo.Epic (CreatedOn, Effort, EpicNr, Id, ModifiedOn, StartDate, State, TargetDate, TeamId, TeamIterationId, Title )
  - dbo.Event (Content, CreatedBy, CreatedOn, EntityId, EntityText, EntityType, EventTypeId, Id, Path, Scope, UpdatedBy, UpdatedOn )
  - dbo.EventType (ApplicationPageId, CreatedBy, CreatedOn, EventTypeName, Id, IsScopeRequired, UpdatedBy, UpdatedOn )
  - DevOps.ExternalProjectConfig (EntityCreatedAt, EntityModifiedAt, ID, IsActive, OrganisationName, PatKeyName, ProjectName )
  - dbo.Feature (CreatedOn, Effort, EpicId, FeatureNr, Id, MilestoneId, ModifiedOn, StartDate, State, TargetDate, TeamId, TeamIterationId, Title )
  - DevOps.Group (Description, Descriptor, DirectoryAlias, DisplayName, Domain, EntityCreatedAt, EntityModifiedAt, MailAddress, MetaType, OrganisationID, Origin, OriginID, PrincipalName, SubjectKind )
  - dbo.GroupRoleAssignment (CreatedBy, CreatedOn, GroupId, Id, RoleId, UpdatedBy, UpdatedOn )
  - dbo.Hashtag (CreatedOn, Id, ModifiedOn, Name )
  - dbo.HealthResults (CreatedOn, Id, ModifiedOn, ServiceName, Status )
  - dbo.Invoice (BillingOption, CreatedOn, CustomerNumber, DatevAccounting, DunningInformation, EndingDunning, FirstInvoiceText, Id, IntroductionDunning, InvoicedOn, InvoiceNumber, IsDunningActive, LevelOfDunning, ModifiedOn, PaidOn, PaymentTarget, PaymentTargetDunning, PlannedInvoicedOn, SalesorderId, SecondInvoiceText, State )
  - dbo.InvoiceDetail (CreatedOn, CustomerNumber, Description, Id, InvoiceId, MilestoneId, ModifiedOn, OrderIndex, PositionNumber, PricePerUnit, Quantity, State, TeamIterationId, TypeOfRevenue, TypeOfUnit )
  - dbo.InvoiceSplit (AuszublendendeRechnung, Bemerkung, Betrag, CreatedOn, Id, MatchDatev, ModifiedOn, MonatBuchung, MonatGegenbuchung, RechnungsNr, SalesOrderId )
  - DevOps.Iteration (EntityCreatedAt, EntityModifiedAt, FinishDate, IterationID, IterationName, IterationPath, OrganisationID, ProjectID, StartDate )
  - dbo.IterationMilestone (CreatedOn, Id, MilestoneId, ModifiedOn, TeamIterationId )
  - reporting.Iterationsumsatz (AbgerechnetFlag, AuftragConsultingRole, AuftragNr, BuchungsMonat, FeatureId, FeatureNr, GesplitteterUmsatz, IstPlanungsprojekt, IterationPfad, MeilensteinName, MilestoneId, RechnungsDatumIstPlan, RechnungsUmsatz, SalesorderId, TeamIterationId, Vertragsart )
  - dbo.Location (CreatedBy, CreatedOn, Id, Name, UpdatedBy, UpdatedOn )
  - dbo.LogsForSPOsExe (ExecutionTime, Id, LogMessage )
  - dbo.MapUserName (DisplayName, ObjectId )
  - reporting.MeilensteinStunden (AuftragNr, FeatureId, FeatureNr, IterationPfad, Leistungsstatus, MeilensteinName, Meilensteinstatus, MilestoneId, SalesorderId, StdIstFeature, StdPlanFeature, SumStdIstFeature, SumStdPlanFeature, TeamIterationId, UserStoryNr )
  - DevOps.Membership (ContainerDescriptor, ContainerGroupPrinicalName, EntityCreatedAt, EntityModifiedAt, MemberDescriptor, MemberGroupPrincipalName, MemberUserMailAddress, OrganisationID )
  - dbo.Milestone (CalculatedRate, CompletedOn, CreatedOn, Id, ModifiedOn, Name, ReportingTag, SalesorderId, State, Volume )
  - reporting.MitarbeiterAbrechnung (AuftragBez, AuftragConsultingRole, AuftragNr, BeauftragungsNr, Datum, EuroBetrag, IstPlanungsprojekt, IterationEnde, IterationPfad, IterationStart, KostenExtern, MitarbeiterEmail, MitarbeiterName, MitarbeiterTyp, Monat, OperativFTE, Organisationseinheit, PlanIstFlag, SalesorderId, Status, StdInvestition, StdIstAbgerechnet, StdIstOKZeit, StdKapaPlanung, StdKrank, StdUrlaub, TagessatzKunde, TeamName, TeamPfad, VertragFTE, Vertragsart )
  - reporting.MitarbeiterDatum (Arbeitsstunden, ConsultingStufe, Datum, Email, EmployeeId, GeändertAm, Mentor, MentorEmail, MitarbeiterTyp, Monat, Name, NameVorname, OperativFTE, Organisationseinheit, Standort, Stundensatz, VertragFTE )
  - dbo.Notification (Channel, Content, CreatedBy, CreatedOn, EmailAddress, EventId, Id, Path, ReadOn, SendOn, Title, UpdatedBy, UpdatedOn, UserId )
  - dbo.NotificationQueue (Channel, Content, CreatedBy, CreatedOn, DueDate, EmailAddress, EventId, Id, Path, Title, UpdatedBy, UpdatedOn, UserId )
  - dbo.OKCalendarDay (CalendarDayID, Comment, Date, DateName, DayOfMonth, DayOfWeek, DayOfYear, Month, WorkingHours )
  - dbo.oksales_salesorder (Auftrags-ID, Auftragsname, Auftragsnummer, Besitzer, ErstelltAm, Gesamtbetrag, Kunde )
  - dbo.OperationalCapacity (Email, EmployeeId, ErstelltAm, ExternalCosts, GeändertAm, GültigBis, GültigVon, OperationalCapacityId, OperativFTE, Organisationseinheit )
  - dbo.Opportunity (ActualCloseDate, CreatedOn, CustomerId, Id, ModifiedOn, Name, OpportunityOwner, ProductGroupId, ProjectNumber, RefId, State, TargetCustomerId )
  - DevOps.Organisation (EntityCreatedAt, EntityModifiedAt, IsExternal, OrganisationID, OrganisationName )
  - reporting.PlanIstStunden (AuftragConsultingRole, AuftragNr, BeauftragungsNr, Datum, eMail, EmployeeId, IterationPfad, PlanIstFlag, RatePerDay, SalesorderId, StdAbrechenbar, StdIst, StdIstMitarbeiterTag, StdKrank, StdPlan, StdPlanMitarbeiterTag, StdUrlaub )
  - dbo.ProductGroup (CreatedOn, Id, ModifiedOn, Name, RefId )
  - DevOps.Project (DefaultTeamId, EntityCreatedAt, EntityModifiedAt, LastUpdateTime, OrganisationID, ProjectID, ProjectName, ProjectPath )
  - dbo.QualityReport (CreatedBy, CreatedOn, Date, Id, TeamId, UpdatedBy, UpdatedOn )
  - dbo.QualityReportEntry (Content, CreatedBy, CreatedOn, EntryStatus, Id, QualityReportId, Type, UpdatedBy, UpdatedOn, Visible )
  - dbo.Role (CreatedBy, CreatedOn, Description, Id, Name, UpdatedBy, UpdatedOn )
  - dbo.RoleRightAssignment (AppRightId, CreatedBy, CreatedOn, Id, RoleId, UpdatedBy, UpdatedOn )
  - dbo.Salesorder (AdditionalReference, AdditionalText, AddressCity, AddressCountry, AddressLine1, AddressPostalCode, ContractType, CoOwnerId, CreatedOn, CustomerId, CustomerOrderNumber, DefaultBillingOption, DunningMails, Id, InvoiceRecipientLineOne, InvoiceRecipientLineThree, InvoiceRecipientLineTwo, InvoicingCycle, InvoicingMails, InvoicingOption, IsActive, IsActivityReportRequired, IsBookingRequired, IsCapacityDeactivated, IsInternalOrder, IsPlanning, IsUsedByEveryone, ModifiedOn, Name, Number, OutputFormat, OwnerId, PaymentTarget, ProductGroup, SalesOpportunityNumber, TargetCustomer, TeamId, TravelCostAllowance, TypeOfUnit, VAT, Volume, VolumeInitial )
  - dbo.ScopeInterval (CreatedBy, CreatedOn, Id, Name, UpdatedBy, UpdatedOn, Value )
  - dbo.ScopeReport (Approved, CreatedBy, CreatedOn, Date, Id, ManagementAttentionRequired, ProjectState, TeamId, UpdatedBy, UpdatedOn )
  - dbo.ScopeReportEntry (Content, CreatedBy, CreatedOn, Id, ScopeReportId, Type, UpdatedBy, UpdatedOn )
  - dbo.Skill (CreatedBy, CreatedOn, EmployeeId, Id, ModifiedOn, Name, Status, UpdatedBy )
  - dbo.SkillCycle (EndDate, Id, Name, StartDate )
  - dbo.SkillRating (Comment, CreatedBy, CreatedOn, EmployeeId, Experience, Id, ModifiedOn, Preference, Rating, SkillId, Type, UpdatedBy )
  - dbo.Subscription (Channel, CreatedBy, CreatedOn, EventTypeId, Frequency, Id, Scope, Subscriber, UpdatedBy, UpdatedOn, UserId )
  - dbo.Team (AllowExternalEmployees, CreatedOn, End, Id, IsActive, IsDevOpsEnabled, IsExternal, ModifiedOn, MSGroupId, MSPlannerId, Name, Path, PersonalTeamRight, ProjectName, ScopeIntervalId, ScopingInterval, Start )
  - DevOps.Team (Area, EntityCreatedAt, EntityModifiedAt, IsDefaultTeam, OrganisationID, OrganisationName, ProjectID, ProjectName, TeamID, TeamName )
  - dbo.TeamAccessControl (CreatedOn, EmployeeId, Id, ModifiedOn, TeamId )
  - dbo.TeamIteration (CreatedOn, DevOpsIterationId, EndDate, Generated, Id, ModifiedOn, Name, Path, StartDate, TeamId )
  - DevOps.TeamIteration (IterationID, IterationPath, TeamID )
  - dbo.TeamParticipant (CreatedBy, CreatedOn, EmployeeId, Id, ProjectRole, TeamId, UpdatedBy, UpdatedOn )
  - dbo.TeamProfile (BusinessUnitId, CommitmentKAM, CommitmentKAMDate, CommitmentPL, CommitmentPLDate, CreatedBy, CreatedOn, Description, Expires, Id, Priority, ProjectScope, SteeringCommittee, Tags, TeamId, UpdatedBy, UpdatedOn )
  - dbo.TeamSkill (CreatedBy, CreatedOn, Id, ModifiedOn, SkillId, TeamId, UpdatedBy )
  - dbo.TemporaryAccess (AccessDate, CreatedOn, EmployeeId, Id, ModifiedOn, SalesorderId )
  - dbo.TimeBooking (CreatedBy, CreatedOn, Date, Description, EmployeeId, End, Id, Location, ModifiedBy, ModifiedOn, OffTime, SalesorderId, SourceFlag, Start, VacationId, WorkingHours, WorkItemId )
  - dbo.TimeBookingHashtag (CreatedOn, HashtagId, Id, ModifiedOn, TimeBookingId )
  - DevOps.User (Descriptor, DirectoryAlias, DisplayName, Domain, EntityCreatedAt, EntityModifiedAt, MailAddress, MetaType, OrganisationID, Origin, OriginID, PrincipalName, SubjectKind )
  - dbo.UserRoleAssignment (CreatedBy, CreatedOn, Id, RoleId, UpdatedBy, UpdatedOn, UserId )
  - dbo.UserStory (CreatedOn, FeatureId, Id, ModifiedOn, State, StoryPoints, TeamId, TeamIterationId, Title, UserStoryNr )
  - dbo.Vacation (ApprovedBy, ApproverComment, ApproverId, Comment, CreatedBy, CreatedOn, Days, EmployeeId, End, HalfVacationDay, Id, ModifiedBy, ModifiedOn, SourceFlag, Start, State, Type )
  - DevOps.WorkItem (Application, AssignedTo, ChangedDate, ClosedDate, Completed, CreatedDate, Effort, EntityCreatedAt, EntityModifiedAt, Environment, IterationID, OriginalEstimate, ParentWorkItemID, Priority, ProjectID, RemainingWork, StartDate, State, StoryPoints, TargetDate, TeamID, TicketNummer, Title, WorkItemID, WorkItemType )
  - dbo.WorkItem (Application, AssignedTo, ClosedDate, Completed, CreatedOn, Environment, Id, IncidentNr, ModifiedOn, OriginalEstimate, Priority, RemainingWork, State, StateWorkItem, TeamIterationId, Title, UserStoryId, Version, WorkItemNr, WorkItemType )

  Include column name headers in the query results.

  Always provide your answer in the JSON format below:

  { "summary": "your-summary", "query":  "your-query" }

  Output ONLY JSON.
  In the preceding JSON response, substitute "your-query" with Microsoft SQL Server Query to retrieve the requested data.
  In the preceding JSON response, substitute "your-summary" with a summary of the query.
  Always include all columns in the table.
  If the resulting query is non-executable, replace "your-query" with NA, but still substitute "your-query" with a summary of the query.
  Do not use MySQL syntax.`;

  const response = await openAI.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: args.prompt,
      },
    ],
  });
  const { summary, query } = extractAIQuery(response);

  try {
    if (query !== "NA") {
      const result = await getDataTable(query);
      return {
        status: "OK",
        response: result,
      };
    } else {
      return {
        status: "ERROR",
        errors: [{ message: "The query is not executable." }],
      };
    }
  } catch (error) {
    console.error("🔴 Error generating or executing the SQL query:\n", error);
    return {
      status: "ERROR",
      errors: [{ message: "Error generating or executing the SQL query." }],
    };
  }
};

export async function getDataTable(
  sqlQuery: string
): Promise<Array<Array<string>>> {
  const connectionString =
    "Server=tcp:nstokchat.database.windows.net,1433;Initial Catalog=OKChatData;Persist Security Info=False;User ID=nst;Password=DerLOL123456789;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

  const rows: Array<Array<string>> = [];

  let pool: sql.ConnectionPool | null = null;

  try {
    // Connect to the database
    pool = await sql.connect(connectionString);

    // Execute the query
    const result = await pool.request().query(sqlQuery);

    // Check if there are any rows in the result
    if (result.recordset.length > 0) {
      // Add column headers
      const headers = Object.keys(result.recordset[0]);
      rows.push(headers);

      // Add rows
      result.recordset.forEach((row) => {
        const cols = headers.map((header) =>
          row[header] ? row[header].toString() : "DataTypeConversionError"
        );
        rows.push(cols);
      });
    }
  } catch (err) {
    console.error("SQL error", err);
  } finally {
    // Close the database connection
    if (pool) {
      await pool.close();
    }
  }

  console.log("🟢 SQL Query Result:", rows);
  return rows;
}
export function extractAIQuery(chatCompletionsResponse: any): {
  summary: string;
  query: string;
} {
  // Entferne die Markierungen, die den JSON-Code umgeben
  const cleanedContent = chatCompletionsResponse.choices[0].message.content
    .replace("```json", "")
    .replace("```", "")
    .replace("\\", "");

  // Deserialisiere das JSON zu einem AIQuery-Objekt
  const response: AIQuery = JSON.parse(cleanedContent);

  // Extrahiere die gewünschten Eigenschaften
  const summary = response.summary;
  const query = response.query;

  return { summary, query };
}
