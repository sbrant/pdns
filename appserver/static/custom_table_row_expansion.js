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
                    preview: true
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
    //        render: function($container, rowData) {
    //            // Print the rowData object to the console
    //            console.log("RowData: ", rowData);

    //            // Display some of the rowData in the expanded row
    //            $container.append('<div>'
    //                + '<b>rowIndex</b>: ' + rowData.rowIndex + '<br>'
    //                + '<b>colspan</b>: ' + rowData.colspan + '<br>'
    //                + '<b>fields</b>: ' + rowData.fields + '<br>'
    //                + '<b>values</b>: ' + rowData.values
    //                + '</div>');
    //        } 
            render: function($container, rowData) {
                // rowData contains information about the row that is expanded.  We can see the cells, fields, and values
                // Assign the data from the desired cell to a variable for use
                var upperDom = _(rowData.cells).find(function (cell) {
                   return cell.field === 'upper_dom';
                });
                this._searchManager.set({ 
			search: '| tstats count FROM datamodel=pDNS_CIM WHERE DNS.query=*' + upperDom.value + ' by _time span=2h',
			earliest_time: '-7d',
			latest_time: 'now' 
		});
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
