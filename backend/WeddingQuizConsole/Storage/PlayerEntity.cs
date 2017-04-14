namespace WeddingQuizConsole.Storage
{
    using System;
    using System.Collections.Generic;
    using Microsoft.WindowsAzure.Storage;
    using Microsoft.WindowsAzure.Storage.Table;

    public class PlayerEntity : TableEntity
    {
        public PlayerEntity()
        {

        }

        public string Username { get { return this.RowKey; } set { this.RowKey = value; } }

        public string GameId { get { return this.PartitionKey; } set { this.PartitionKey = value; } }

        public int Score { get; set; }
        public void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext)
        {
            base.ReadEntity(properties, operationContext);
        }

        public IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            return base.WriteEntity(operationContext);
        }

    }
}