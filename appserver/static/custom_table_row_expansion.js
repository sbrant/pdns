require([
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/chartview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc',
    'underscore',
    'splunkjs/mvc/simplexml/ready!'],function(
    TableView,
    ChartView,
    SearchManager,
    mvc,
    _
    ){

    var EventSearchBasedRowExpansionRenderer = TableView.BaseRowExpansionRenderer.extend({
        initialize: function(args) {
            // initialize will run once, so we will set up a search and a chart to be reused.
            this._searchManager = new SearchManager({
                id: 'details-search-manager',
                preview: false
            });
            this._chartView = new ChartView({
                managerid: 'details-search-manager',
                'charting.legend.placement': 'none'
            });
        },

        canRender: function(rowData) {
            // Since more than one row expansion renderer can be registered we let each decide if they can handle that
            // data
            // Here we will always handle it.
            return true;
        },

        render: function($container, rowData) {
            // rowData contains information about the row that is expanded.  We can see the cells, fields, and values
            // We will find the sourcetype cell to use its value
            var domCell = _(rowData.cells).find(function (cell) {
               cell.field === 'upper_dom';
               return cell.field.toLowerCase();
            });

            //update the search with the sourcetype that we are interested in
            this._searchManager.set({ search: '| tstats sum(DNS.bytes_in) AS totalin sum(DNS.bytes_out) AS totalout FROM datamodel=pDNS_CIM WHERE DNS.ut_domain=' + domCell.value + ' BY DNS.query'});

            // $container is the jquery object where we can put out content.
            // In this case we will render our chart and add it to the $container
            $container.append(this._chartView.render().el);
        }
    });

    var tableElement = mvc.Components.getInstance("expand_with_events");
    tableElement.getVisualization(function(tableView) {
        // Add custom cell renderer, the table will re-render automatically.
        tableView.addRowExpansionRenderer(new EventSearchBasedRowExpansionRenderer());
    });
});
