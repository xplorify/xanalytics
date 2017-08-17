<script>
//Importing Line class from the vue-chartjs wrapper
import VueCharts from 'vue-chartjs'
import { Line } from 'vue-chartjs'
import moment from 'moment'

//Exporting this so it can be used in other components
export default Line.extend({
  props: ['filterForm', 'connectionsArray'],
  data() {
    return {
      filterFormObj: this.filterForm,
      //Chart.js options that controls the appearance of the chart
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            gridLines: {
              display: true
            }
          }],
          xAxes: [{
            gridLines: {
              display: false
            }
          }]
        },
        legend: {
          display: true
        },
        responsive: true,
        maintainAspectRatio: false
      },
      colors: ['#f87979', '#f8c779', '#f8e979', '#ebf879', '#c3f879', '#7ff879', '#79f8b0', '#79f8e2', '#79c9f8', '#799ff8', '#7b79f8', '#a779f8', '#c579f8', '#e279f8', '#f879e0', '#f879ab', '#f87979']
    }
  },
  mounted() {
    //renderChart function renders the chart with the datacollection and options object.
    this.renderChart(this.getDataCollections(), this.options);
  },
  methods: {
    getConnectionsByDate: function (connArray) {
      var labels = this.getLabels();
      var countings = [];
      labels.forEach(function (label) {
        var count = 0;
        connArray.forEach(function (conn) {
          var date = moment(conn.startDate).format("DD-MM-YYYY");
          if (label == date) {
            count++;
          }
        });
        countings.push(count);
      });

      return countings;
    },
     getDataCollections: function () {
      var labels = this.getLabels();
      return {
        //Data to be represented on x-axis
        labels: labels,
        datasets: this.getDataSets()
      }
    },
    getDataSets: function () {
      var datasets = [];
      var i = 1;
      var self = this;
      this.connectionsArray.forEach(function (conn) {
        var set = {
          label: conn._id,
          backgroundColor: self.colors[i],
          pointBackgroundColor: self.colors[i],
          borderWidth: 2,
          pointBorderColor: self.colors[i],
          fill: false,
          //Data to be represented on y-axis
          data: self.getConnectionsByDate(conn.data ? conn.data : conn.connections)
        }
        i++;
        datasets.push(set);
      });

      return datasets;
    },
    getLabels: function () {
      var dates = [];
      var from = moment(this.filterFormObj.from);
      var to = moment(this.filterFormObj.to);
      var currDate = from.clone().startOf('day');
      var lastDate = to.clone().startOf('day');

      dates.push(from.format("DD-MM-YYYY"));
      var temp = from;
      while (temp.startOf('day') < to.startOf('day')) {
        var date = temp.add(1, 'day');
        dates.push(date.format("DD-MM-YYYY"));
      }
      return dates;
    }
  },
  watch: {
     connectionsArray: {
      handler: function (val) {
      this.renderChart(this.getDataCollections(), this.options);
    }, 
      deep: true
    }
  }
})
</script>