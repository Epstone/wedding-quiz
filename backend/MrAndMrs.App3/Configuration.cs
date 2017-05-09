using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MrAndMrs.App3
{
    public class AppOptions
    {
        public Connection Connection { get; set; }
    }

        
    public class Connection
    {
        public string MrAndMrsTableStorage { get; set; }
    }

}
