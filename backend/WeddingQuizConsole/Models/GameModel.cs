namespace WeddingQuizConsole.Models
{
    using System;
    using System.Collections.Generic;
    using Microsoft.WindowsAzure.Storage;
    using Microsoft.WindowsAzure.Storage.Table;
    using Newtonsoft.Json;

    public class GameEntity : TableEntity
    {
        public GameEntity()
        {
            string hashCode = String.Format("{0:X}", Guid.NewGuid().ToString().GetHashCode());
            this.PartitionKey = hashCode;
            this.RowKey = hashCode;
        }

        public string GameId { get; set; }

        public List<string> Questions { get; set; }

        public override void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext)
        {
            var questionsJson = properties["questions"].StringValue;
            this.Questions = JsonConvert.DeserializeObject<List<string>>(questionsJson);

            base.ReadEntity(properties, operationContext);
        }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);
            result.Add("questions", new EntityProperty(JsonConvert.SerializeObject(this.Questions)));
            return result;
        }
    }
}
